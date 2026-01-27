# DEBUGGING BÁSICO EN REACT
## Guía Completa de Debugging Fundamentos

---

## 1.1 CONSOLE DEBUGGING

### Documentación Oficial

**Console API (MDN Web Docs)**
- URL: https://developer.mozilla.org/en-US/docs/Web/API/console
- Especificación completa de todos los métodos de console disponibles en navegadores modernos

**React Official Docs - Debugging**
- URL: https://react.dev/learn
- Documentación oficial de React sobre debugging y mejores prácticas

---

### Métodos Principales de Console

#### 1. console.log() - Logging Básico
```javascript
// Debugging props
function UserProfile({ user, settings }) {
  console.log('UserProfile props:', { user, settings });
  
  return <div>{user.name}</div>;
}

// Debugging state
function Counter() {
  const [count, setCount] = useState(0);
  
  console.log('Counter state:', count);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

#### 2. console.table() - Datos Tabulares
```javascript
// Visualizar arrays de objetos
function UserList({ users }) {
  console.table(users); // Muestra usuarios en formato tabla
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

// Ejemplo de salida en consola:
// ┌─────────┬────┬─────────┬───────────────┐
// │ (index) │ id │  name   │     email     │
// ├─────────┼────┼─────────┼───────────────┤
// │    0    │ 1  │ 'John'  │ 'john@ex.com' │
// │    1    │ 2  │ 'Jane'  │ 'jane@ex.com' │
// └─────────┴────┴─────────┴───────────────┘
```

#### 3. console.group() - Agrupación de Logs
```javascript
function ProductCard({ product }) {
  console.group(`ProductCard - ${product.name}`);
  console.log('Product ID:', product.id);
  console.log('Price:', product.price);
  console.log('Stock:', product.stock);
  console.groupEnd();
  
  return <div>{product.name}</div>;
}

// Versión colapsada por defecto
function useDebugEffect(effectName, dependencies) {
  console.groupCollapsed(`Effect: ${effectName}`);
  console.log('Dependencies:', dependencies);
  console.trace('Call stack');
  console.groupEnd();
}
```

#### 4. console.time() - Medición de Performance
```javascript
function ExpensiveComponent({ data }) {
  console.time('ExpensiveComponent Render');
  
  // Operación costosa
  const processedData = data.map(item => {
    // procesamiento complejo
    return processItem(item);
  });
  
  console.timeEnd('ExpensiveComponent Render');
  // Output: ExpensiveComponent Render: 45.234ms
  
  return <div>{processedData.length} items</div>;
}

// Timing de efectos
function DataFetcher() {
  useEffect(() => {
    console.time('Data Fetch');
    
    fetchData().then(result => {
      console.timeEnd('Data Fetch');
      // Output: Data Fetch: 1234.567ms
    });
  }, []);
}
```

#### 5. console.warn() y console.error()
```javascript
function SafeComponent({ data }) {
  if (!data) {
    console.warn('SafeComponent: data prop is undefined');
    return null;
  }
  
  if (data.length === 0) {
    console.error('SafeComponent: data array is empty');
    return <div>No data available</div>;
  }
  
  return <div>{data.length} items</div>;
}
```

#### 6. console.trace() - Stack Trace
```javascript
function NestedComponent() {
  console.trace('NestedComponent render path');
  // Muestra el stack completo de llamadas
  
  return <div>Nested</div>;
}
```

---

### Debugging de Ciclos de Vida en React

#### Debugging con useEffect
```javascript
// Oficial de React Docs
function ChatRoom({ roomId }) {
  // Debug: Ver qué dependencias causan re-ejecución
  useEffect(() => {
    console.log('Effect running with:', { roomId });
    
    const connection = createConnection(roomId);
    connection.connect();
    
    return () => {
      console.log('Cleanup for:', roomId);
      connection.disconnect();
    };
  }, [roomId]);
  
  // Log dependencies para debug
  console.log('Current dependencies:', [roomId]);
  
  return <div>Chat: {roomId}</div>;
}
```

#### Debugging de Dependencies
```javascript
// Técnica oficial de React para debug de useEffect
function MyComponent({ serverUrl, roomId }) {
  useEffect(() => {
    // ... código del efecto
  }, [serverUrl, roomId]);

  // Log para ver cambios en dependencies
  console.log('Dependencies:', [serverUrl, roomId]);
}

// Para comparar entre renders en la consola:
// Guarda el primer array como temp1
// temp1 = $r.state (en React DevTools)
// Después del siguiente render:
// temp2 = $r.state
// Object.is(temp1[0], temp2[0]); // ¿serverUrl cambió?
// Object.is(temp1[1], temp2[1]); // ¿roomId cambió?
```

#### Debugging de useMemo y useCallback
```javascript
// Debug useMemo
function FilteredList({ items, filter }) {
  const filtered = useMemo(() => {
    console.log('useMemo recalculating');
    return items.filter(filter);
  }, [items, filter]);
  
  console.log('Dependencies:', [items, filter]);
  
  return <ul>{filtered.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}

// Debug useCallback
function Form({ productId, referrer }) {
  const handleSubmit = useCallback((orderDetails) => {
    console.log('Callback created');
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);
  
  console.log('Callback dependencies:', [productId, referrer]);
  
  return <CheckoutForm onSubmit={handleSubmit} />;
}
```

---

### Custom Debug Hooks

#### useWhyDidYouUpdate
```javascript
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// Uso
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  return <div>{props.value}</div>;
}
```

#### useTraceUpdate
```javascript
function useTraceUpdate(props) {
  const prev = useRef(props);
  
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (prev.current[key] !== value) {
        acc[key] = [prev.current[key], value];
      }
      return acc;
    }, {});
    
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    
    prev.current = props;
  });
}

// Uso
function ExpensiveComponent(props) {
  useTraceUpdate(props);
  return <div>...</div>;
}
```

---

### Herramientas para Remover Logs en Producción

#### 1. babel-plugin-transform-remove-console
```bash
npm install --save-dev babel-plugin-transform-remove-console
```

**Configuración en babel.config.js:**
```javascript
module.exports = {
  presets: ['@babel/preset-react'],
  env: {
    production: {
      plugins: [
        ['transform-remove-console', { 
          exclude: ['error', 'warn'] // Mantener errors y warnings
        }]
      ]
    }
  }
};
```

#### 2. Vite - Drop Console en Build
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remueve todos los console.*
        drop_debugger: true, // Remueve debugger statements
      }
    }
  }
});
```

**Configuración selectiva:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    terserOptions: {
      compress: {
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.trace',
        ], // Mantener console.warn y console.error
      }
    }
  }
});
```

#### 3. Webpack - TerserPlugin
```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
};
```

#### 4. ESLint - Advertencias en Desarrollo
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
};
```

---

### Mejores Prácticas de Logging

#### ✅ DO: Logging Estructurado
```javascript
// BIEN: Logging con contexto
function ProductCard({ product }) {
  console.log('ProductCard:', {
    id: product.id,
    name: product.name,
    price: product.price,
    timestamp: new Date().toISOString()
  });
}

// BIEN: Usar prefijos consistentes
const DEBUG = {
  log: (msg, data) => console.log(`[APP]`, msg, data),
  warn: (msg, data) => console.warn(`[APP]`, msg, data),
  error: (msg, data) => console.error(`[APP]`, msg, data),
};

function MyComponent() {
  DEBUG.log('Component mounted', { userId: 123 });
}
```

#### ❌ DON'T: Logging Desestructurado
```javascript
// MAL: Sin contexto
console.log(product); // ¿Qué componente? ¿Cuándo?

// MAL: Múltiples argumentos sin estructura
console.log('Product', product.id, product.name, product.price);

// MAL: String concatenation
console.log('Product: ' + product.name + ', Price: ' + product.price);
```

#### Logging Condicional
```javascript
// Crear logger condicional
const isDev = process.env.NODE_ENV === 'development';

const logger = {
  log: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  error: (...args) => console.error(...args), // Siempre logear errores
};

// Uso
function MyComponent() {
  logger.log('Component render');
  logger.error('Critical error'); // Se muestra en prod
}
```

---

### Casos de Uso Avanzados

#### Debugging de Event Handlers
```javascript
function PointerExample() {
  // Ejemplo oficial de React Docs
  return (
    <div
      onPointerEnter={e => console.log('onPointerEnter (parent)')}
      onPointerLeave={e => console.log('onPointerLeave (parent)')}
      style={{ padding: 20, backgroundColor: '#ddd' }}
    >
      <div
        onPointerDown={e => console.log('onPointerDown (child)', e)}
        onPointerMove={e => console.log('onPointerMove (child)')}
        onPointerUp={e => console.log('onPointerUp (child)')}
        style={{ padding: 20, backgroundColor: 'lightyellow' }}
      >
        Hover and click me
      </div>
    </div>
  );
}
```

#### Debugging de Error Boundaries
```javascript
// Ejemplo oficial de React Docs
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log de errores a servicio externo
    console.error('ErrorBoundary caught:', {
      error: error.toString(),
      componentStack: info.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // En producción, enviar a servicio de logging
    // logErrorToService(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

#### Debugging de Render Performance
```javascript
function useRenderCount(componentName) {
  const renders = useRef(0);
  
  useEffect(() => {
    renders.current += 1;
    console.log(`${componentName} render count:`, renders.current);
  });
}

function MyComponent(props) {
  useRenderCount('MyComponent');
  
  return <div>{props.value}</div>;
}
```

---

### Recursos Adicionales

**Artículos y Tutoriales:**
- [Chrome DevTools Console Reference](https://developer.chrome.com/docs/devtools/console/)
- [React Debugging Guide - Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Debugging React Performance - Web.dev](https://web.dev/articles/react)

**Stack Overflow - Problemas Comunes:**
- [How to debug React apps](https://stackoverflow.com/questions/21587122/how-to-debug-react-apps)
- [Console log not showing in React](https://stackoverflow.com/questions/42436897/why-is-my-console-log-not-showing-in-react)
- [Remove console logs in production](https://stackoverflow.com/questions/41040266/remove-console-logs-in-production-build)

**GitHub Examples:**
- [React DevTools Source](https://github.com/facebook/react/tree/main/packages/react-devtools)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)

---

## 1.2 BREAKPOINTS Y DEBUGGER

### debugger Statement

#### Uso Básico
```javascript
function calculatePrice(product, discount) {
  debugger; // Pausa ejecución aquí
  
  const basePrice = product.price;
  const discountAmount = basePrice * (discount / 100);
  const finalPrice = basePrice - discountAmount;
  
  return finalPrice;
}
```

#### En Componentes React
```javascript
function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    debugger; // Inspeccionar estado antes de añadir
    
    addToCart({
      product,
      quantity,
      timestamp: Date.now()
    });
  };
  
  return (
    <div>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

#### Debugging de Effects
```javascript
function DataFetcher({ userId }) {
  useEffect(() => {
    debugger; // Pausa cuando el efecto se ejecuta
    
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        debugger; // Pausa cuando llegan los datos
        setUser(data);
      });
  }, [userId]);
}
```

---

### Conditional Breakpoints

#### En Chrome DevTools

**1. Breakpoint Básico:**
- Abrir DevTools (F12)
- Ir a Sources tab
- Encontrar archivo
- Click en número de línea

**2. Conditional Breakpoint:**
- Click derecho en número de línea
- Seleccionar "Add conditional breakpoint"
- Ingresar condición

```javascript
// Ejemplo: Solo pausar cuando userId es específico
function fetchUser(userId) {
  // Conditional breakpoint: userId === 123
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Ejemplo: Solo pausar cuando hay error
function processData(data) {
  // Conditional breakpoint: data.length === 0
  if (data.length === 0) {
    throw new Error('No data');
  }
  return data.map(item => item.value);
}
```

**3. Logpoint (Chrome):**
- Click derecho en línea
- "Add logpoint"
- Ingresa mensaje sin pausar ejecución

```javascript
// Logpoint: "User ID:", userId, "Name:", user.name
function displayUser(userId, user) {
  return <div>{user.name}</div>;
}
```

#### Breakpoints Avanzados

**Watch Expressions:**
```javascript
// En DevTools Watch panel, agregar:
// - props.userId
// - state.isLoading
// - localVariable
```

**XHR/Fetch Breakpoints:**
- DevTools > Sources > XHR/fetch breakpoints
- Agregar URL pattern
- Pausar en todas las requests que coincidan

**Event Listener Breakpoints:**
- Sources > Event Listener Breakpoints
- Seleccionar tipo de evento (click, change, submit)
- Pausar cuando el evento se dispara

---

### Source Maps Configuration

#### Vite Source Maps
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    sourcemap: true, // Habilita source maps en producción
    // o
    sourcemap: 'inline', // Source maps inline
    // o
    sourcemap: 'hidden', // Source maps sin referencia en bundle
  },
  
  // En desarrollo, source maps están habilitados por defecto
  server: {
    sourcemapIgnoreList: false, // Mostrar node_modules en source maps
  }
});
```

**Configuración por Entorno:**
```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: mode === 'development' ? true : 'hidden',
      minify: mode === 'production' ? 'terser' : false,
    }
  };
});
```

#### Webpack Source Maps
```javascript
// webpack.config.js
module.exports = {
  mode: 'development',
  devtool: 'source-map', // Producción de alta calidad
  
  // Opciones de devtool:
  // 'eval' - Más rápido, rebuild rápido
  // 'source-map' - Calidad completa, lento
  // 'cheap-module-source-map' - Balance calidad/velocidad
  // 'inline-source-map' - Source map inline en bundle
  // 'hidden-source-map' - Sin referencia en bundle
};
```

**Desarrollo vs Producción:**
```javascript
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    devtool: isProduction 
      ? 'hidden-source-map'  // Prod: source maps sin exponer
      : 'eval-source-map',   // Dev: rápido rebuild
  };
};
```

#### Verificar Source Maps

**En Chrome DevTools:**
1. Abrir DevTools > Sources
2. Buscar archivo original (no minificado)
3. Si ves código original, source maps funcionan

**Debugging Source Maps:**
```bash
# Verificar que el source map existe
ls -la dist/*.map

# Verificar referencia en bundle
tail dist/index.js
# Debe mostrar: //# sourceMappingURL=index.js.map
```

---

### Debugging de Código Asíncrono

#### Async/Await Debugging
```javascript
// Pausar en cada paso de async function
async function fetchUserData(userId) {
  debugger; // Punto 1: Inicio
  
  try {
    const response = await fetch(`/api/users/${userId}`);
    debugger; // Punto 2: Después del fetch
    
    const data = await response.json();
    debugger; // Punto 3: Después de parsear JSON
    
    return data;
  } catch (error) {
    debugger; // Punto 4: En caso de error
    console.error('Fetch failed:', error);
    throw error;
  }
}

// En React Component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      debugger; // Pausar antes de fetch
      const userData = await fetchUserData(userId);
      debugger; // Pausar después de fetch
      setUser(userData);
    }
    
    loadUser();
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

#### Promise Debugging
```javascript
function fetchData() {
  return fetch('/api/data')
    .then(response => {
      debugger; // Pausa en then
      return response.json();
    })
    .then(data => {
      debugger; // Pausa después de parsear
      return processData(data);
    })
    .catch(error => {
      debugger; // Pausa en error
      console.error('Error:', error);
    });
}
```

#### Debugging Promise.all
```javascript
async function fetchMultipleResources() {
  debugger; // Antes de Promise.all
  
  const [users, products, orders] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/products').then(r => r.json()),
    fetch('/api/orders').then(r => r.json()),
  ]);
  
  debugger; // Después de que todas se resuelvan
  
  return { users, products, orders };
}
```

#### Async Breakpoints en Chrome
**Pause on Caught Exceptions:**
1. DevTools > Sources
2. Click en icono de pausa con símbolo de stop
3. Check "Pause on caught exceptions"
4. Ahora pausa en catch blocks

**Call Stack Async:**
- Chrome muestra "async" en call stack
- Click en frames para navegar entre async calls

#### Debugging Race Conditions
```javascript
function useDataFetch(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      debugger; // Ver si hay múltiples llamadas simultáneas
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!cancelled) {
        debugger; // Verificar si esta llamada fue cancelada
        setData(result);
      } else {
        console.log('Fetch cancelled for:', url);
      }
    }
    
    fetchData();
    
    return () => {
      cancelled = true; // Cleanup: prevenir race condition
    };
  }, [url]);
  
  return data;
}
```

---

### Recursos de Breakpoints y Debugger

**Documentación Oficial:**
- [Chrome DevTools - Pause Code With Breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints/)
- [Firefox Debugger](https://firefox-source-docs.mozilla.org/devtools-user/debugger/)
- [Vite - Build Options](https://vitejs.dev/config/build-options.html#build-sourcemap)

**Tutoriales:**
- [Debugging JavaScript - Google Chrome](https://developer.chrome.com/docs/devtools/javascript/)
- [Async Stack Traces](https://developer.chrome.com/blog/async-stack-traces/)

**Stack Overflow:**
- [How to debug async/await](https://stackoverflow.com/questions/42036865/how-to-debug-async-await-in-chrome)
- [Source maps not working](https://stackoverflow.com/questions/26927793/debugging-webpack-with-source-maps)

---

## 1.3 REACT DEVTOOLS FUNDAMENTOS

### Instalación

#### Browser Extensions
**Chrome:**
- URL: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- Instalación: Click "Add to Chrome"

**Firefox:**
- URL: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
- Instalación: Click "Add to Firefox"

**Edge:**
- URL: https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil
- Instalación: Click "Get"

#### Standalone (Safari y otros)
```bash
# Instalar npm package
npm install -g react-devtools

# Ejecutar
react-devtools
```

**Conectar tu app:**
```html
<!-- Agregar al inicio del <head> -->
<script src="http://localhost:8097"></script>
```

#### React Native
```bash
# React Native 0.76+
# DevTools integrado, se abre automáticamente

# Versiones anteriores
npm install -g react-devtools
react-devtools
```

---

### Verificar Instalación

#### ✅ React DevTools Detectado
**Señales de que funciona:**
1. Icono de React en toolbar del navegador está en color
2. Al abrir DevTools, aparecen tabs "Components" y "Profiler"
3. En console, no hay warnings de React DevTools

#### ❌ React DevTools NO Detectado
**Posibles causas:**

**1. No es una app de React**
```javascript
// Verificar en console:
console.log(window.React); // Debe existir en dev mode
```

**2. Producción Mode (React minificado)**
```javascript
// En modo producción, React DevTools tiene funcionalidad limitada
// Verificar en console:
console.log(process.env.NODE_ENV); // 'production' limita DevTools
```

**Solución: Usar Development Build:**
```javascript
// vite.config.js
export default defineConfig({
  mode: 'development', // Fuerza development mode
});
```

**3. Extensión Deshabilitada**
- Chrome: chrome://extensions
- Verificar que "React Developer Tools" esté habilitado
- Reload la página

**4. Multiple React Versions**
```bash
# Verificar versiones en node_modules
npm ls react
```

**Solución:**
```json
// package.json - Forzar una versión
{
  "resolutions": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

### Components Tab - Inspección

#### Árbol de Componentes
**Navegación:**
- Click en componente para inspeccionar
- Usa flechas para expandir/colapsar
- Buscar componente: Ctrl+F / Cmd+F

**Visualización:**
```
▼ App
  ▼ Header
    - Logo
    - Navigation
  ▼ Main
    ▼ ProductList
      ▼ ProductCard (props: {id: 1, name: "..."})
      ▼ ProductCard (props: {id: 2, name: "..."})
  - Footer
```

#### Inspeccionar Props y State
```javascript
function ProductCard({ id, name, price, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);
  
  return <div>{name} - ${price}</div>;
}
```

**En React DevTools:**
```
ProductCard
├─ props
│  ├─ id: 1
│  ├─ name: "Product Name"
│  ├─ price: 29.99
│  └─ onAddToCart: ƒ ()
└─ state
   ├─ quantity: 1
   └─ inCart: false
```

#### Editar Props y State en Tiempo Real
1. Seleccionar componente
2. En panel derecho, ver "props" y "state"
3. Click en valor para editar
4. El componente se re-renderiza automáticamente

**Ejemplo:**
```
state
└─ quantity: 1  ← Click aquí, cambiar a 5
// Componente se actualiza inmediatamente
```

#### Hooks Debugging
```javascript
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useContext(ThemeContext);
  const userData = useMemo(() => processUser(user), [user]);
  
  return <div>...</div>;
}
```

**En DevTools:**
```
Hooks
├─ State: null
├─ State: true
├─ Context: {theme: "dark"}
└─ Memo: {name: "...", age: ...}
```

---

### Profiler Tab - Performance

#### Grabar Performance Profile
1. Click en tab "Profiler"
2. Click botón record (círculo)
3. Interactuar con app
4. Click stop
5. Ver resultados

**Flame Graph:**
```
App ████████████████ 45ms
├─ Header ███ 5ms
├─ ProductList ████████████ 35ms
│  ├─ ProductCard ██ 8ms
│  ├─ ProductCard ██ 8ms
│  └─ ProductCard ██ 8ms
└─ Footer ██ 5ms
```

**Información mostrada:**
- Tiempo de render de cada componente
- Número de renders
- Componentes que causaron re-renders innecesarios

#### Identificar Re-renders Innecesarios
**Settings > Profiler:**
- ✅ "Highlight updates when components render"
- ✅ "Record why each component rendered while profiling"

**Colores:**
- 🟦 Azul: Render rápido
- 🟨 Amarillo: Render medio
- 🟥 Rojo: Render lento

---

### Soluciones a Problemas Comunes

#### Problema 1: Components sin Nombre
**Síntoma:**
```
<Anonymous>
  <Anonymous>
    <Anonymous>
```

**Causa:**
```javascript
// MAL: Componente anónimo
export default () => <div>Hello</div>;

// MAL: HOC sin displayName
const withData = (Component) => (props) => <Component {...props} />;
```

**Solución:**
```javascript
// BIEN: Named export
export default function MyComponent() {
  return <div>Hello</div>;
}

// BIEN: Named const
const MyComponent = () => <div>Hello</div>;
export default MyComponent;

// BIEN: displayName en HOC
const withData = (Component) => {
  const WithData = (props) => <Component {...props} />;
  WithData.displayName = `WithData(${Component.displayName || Component.name})`;
  return WithData;
};
```

#### Problema 2: DevTools No Muestra Componentes
**Verificar:**
```javascript
// 1. Verificar que React está instalado
import React from 'react'; // Debe estar presente

// 2. Verificar versión de React
console.log(React.version); // Debe ser 16.8+

// 3. En vite.config.js, habilitar React plugin
export default defineConfig({
  plugins: [react()], // Asegurar que está presente
});
```

#### Problema 3: No Puedo Editar Props/State
**Causa:** Componente en producción mode

**Solución:**
```bash
# Desarrollo con Vite
npm run dev  # No 'npm run build'

# Verificar mode
console.log(import.meta.env.MODE); // Debe ser 'development'
```

#### Problema 4: Profiler No Muestra Información
**Causa:** Strict Mode puede duplicar renders

**Verificar:**
```javascript
// index.jsx
<React.StrictMode>  {/* Puede afectar profiling */}
  <App />
</React.StrictMode>
```

**Solución temporal para profiling:**
```javascript
// Solo para profiling, remover StrictMode temporalmente
<App />
```

---

### Features Avanzadas

#### Inspeccionar Contexto
```javascript
const ThemeContext = React.createContext();

function MyComponent() {
  const theme = useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

**En DevTools:**
- Buscar "Context.Provider"
- Ver valor actual
- Ver todos los consumers

#### Suspense Debugging
```javascript
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**En DevTools:**
- Ver estado de Suspense boundaries
- Inspeccionar componentes suspendidos
- Ver fallbacks activos

#### Component Filters
**Settings > Components:**
- Filter por nombre: `ProductCard`
- Filter por tipo: `memo`, `forwardRef`
- Hide components: node_modules

#### Copy Component Props
1. Right-click en componente
2. "Copy props"
3. Pegar en código o console

```javascript
// Copiado desde DevTools:
{
  "id": 1,
  "name": "Product",
  "price": 29.99
}
```

---

### React DevTools Memo Badge ✨

**React Compiler Optimization:**
- Componentes optimizados por React Compiler muestran badge "Memo ✨"
- Indica que el componente está memoizado automáticamente
- No necesita useMemo/useCallback manual

---

### Recursos de React DevTools

**Documentación Oficial:**
- [React DevTools - react.dev](https://react.dev/learn/react-developer-tools)
- [React DevTools GitHub](https://github.com/facebook/react/tree/main/packages/react-devtools)

**Tutoriales:**
- [Introduction to React DevTools](https://www.youtube.com/watch?v=rb1GWqCJid4)
- [React DevTools Tutorial - Chrome Developers](https://developer.chrome.com/docs/devtools/react/)

**Stack Overflow:**
- [React DevTools not detecting React](https://stackoverflow.com/questions/30877155/react-developer-tools-not-detecting-react)
- [How to use React DevTools](https://stackoverflow.com/questions/41920583/how-to-use-react-developer-tools)
- [Component names missing in DevTools](https://stackoverflow.com/questions/53842396/react-component-names-not-showing-in-react-developer-tools)

**GitHub Issues:**
- [React DevTools Troubleshooting](https://github.com/facebook/react/issues/13991)

---

## RESUMEN EJECUTIVO

### Console Debugging
- **console.log, table, group, time** para diferentes tipos de logging
- **Custom hooks** (useWhyDidYouUpdate, useTraceUpdate) para debugging avanzado
- **Herramientas** (babel, terser, vite) para remover logs en producción
- **Mejores prácticas**: Logging estructurado, prefijos, logging condicional

### Breakpoints y Debugger
- **debugger statement** para pausar ejecución
- **Conditional breakpoints** para debugging selectivo
- **Source maps** configurados correctamente (Vite, Webpack)
- **Async debugging** con async/await y promises

### React DevTools
- **Instalación** en Chrome, Firefox, Edge, Safari (standalone)
- **Components tab**: Inspección de props, state, hooks
- **Profiler tab**: Análisis de performance y re-renders
- **Troubleshooting**: Componentes sin nombre, DevTools no detecta React
- **Features avanzadas**: Context, Suspense, Component filters

---

## PRÓXIMOS PASOS

Con estos fundamentos de debugging, estás listo para:
1. **Debugging Avanzado de Hooks** (useEffect, useCallback, useMemo)
2. **Performance Profiling** avanzado
3. **Error Boundaries** y manejo de errores
4. **Testing** con React Testing Library
5. **E2E Testing** con Playwright/Cypress

---

**Fecha de última actualización:** Diciembre 2025
**Versión de React:** 18.x y 19.x
**Navegadores soportados:** Chrome, Firefox, Edge, Safari
