# React Performance Debugging y Optimización - Guía Completa

## Tabla de Contenidos
1. [Identificación de Problemas de Performance](#1-identificación-de-problemas-de-performance)
2. [Re-render Debugging](#2-re-render-debugging)
3. [Bundle Size y Code Splitting](#3-bundle-size-y-code-splitting)
4. [Virtual Lists](#4-virtual-lists)

---

## 1. Identificación de Problemas de Performance

### 1.1 React DevTools Profiler

El React DevTools Profiler es la herramienta principal para identificar problemas de performance en aplicaciones React.

#### Instalación
- Chrome: [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React DevTools](https://addons.mozilla.org/firefox/addon/react-devtools/)

#### Uso Efectivo

**1. Profiler Tab en DevTools:**
- Habilita el modo de grabación
- Interactúa con tu aplicación
- Detén la grabación
- Analiza los resultados

**2. Interpretación de Resultados:**
```
Flamegraph View:
- Altura = profundidad del árbol de componentes
- Ancho = tiempo de renderizado
- Color amarillo = componentes que tardaron más tiempo

Ranked View:
- Lista ordenada de componentes por tiempo de renderizado
- Identifica los componentes más costosos
```

**3. Profiler Programático:**

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id, // identificador del Profiler
  phase, // "mount" o "update"
  actualDuration, // tiempo de renderizado
  baseDuration, // tiempo estimado sin memoización
  startTime, // cuando React comenzó a renderizar
  commitTime, // cuando React commiteó la actualización
  interactions // Set de interacciones rastreadas
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
  
  // Enviar a analytics
  if (actualDuration > 16) { // > 1 frame a 60fps
    sendToAnalytics({
      component: id,
      duration: actualDuration,
      phase
    });
  }
}

function App() {
  return (
    <Profiler id="Navigation" onRender={onRenderCallback}>
      <Navigation />
    </Profiler>
  );
}
```

**4. React Performance Tracks (Chrome DevTools):**

Disponible en builds de desarrollo y profiling:
- **Development**: Habilitado por defecto
- **Profiling**: Solo Scheduler tracks habilitados por defecto
- **Components track**: Solo componentes envueltos en `<Profiler>`

```jsx
// Para habilitar en profiling builds
import { Profiler } from 'react';

function MyApp() {
  return (
    <Profiler id="MyApp" onRender={onRenderCallback}>
      <YourComponents />
    </Profiler>
  );
}
```

### 1.2 Browser Performance Tab

**Uso con React:**

1. **Abrir Performance Tab** en Chrome DevTools (Ctrl+Shift+E)
2. **Grabar interacción** que quieres optimizar
3. **Analizar:**
   - Main thread activity
   - Long tasks (> 50ms)
   - Layout thrashing
   - JavaScript execution time

**Interpretar resultados:**
```
🟥 Scripting (JavaScript)
🟦 Rendering (Layout/Paint)
🟨 Painting
🟩 System
⬜ Idle
```

**Métricas clave:**
- **FPS**: Debe ser ~60fps (16.67ms por frame)
- **Main Thread**: Busca bloques largos de JavaScript
- **Frames**: Identifica frames dropped

### 1.3 Lighthouse Audits para React

**Ejecutar Lighthouse:**
```bash
# Via CLI
npm install -g lighthouse
lighthouse https://example.com --view

# Via DevTools
1. Abrir DevTools
2. Tab "Lighthouse"
3. Seleccionar categorías
4. "Generate report"
```

**User Flows en Lighthouse** (v10+):

Lighthouse ahora puede analizar flujos completos de usuario, no solo pageloads:

```js
import puppeteer from 'puppeteer';
import { startFlow } from 'lighthouse';
import { writeFileSync } from 'fs';

const browser = await puppeteer.launch();
const page = await browser.newPage();
const flow = await startFlow(page);

// Fase 1 - Navegación inicial
await flow.navigate('https://example.com');

// Fase 2 - Interacción (Timespan)
await flow.startTimespan();
await page.click('button.search');
await page.type('input.search', 'React');
await page.click('button.submit');
await flow.endTimespan();

// Fase 3 - Snapshot del estado actual
await flow.snapshot();

// Fase 4 - Navegación iniciada por usuario
await flow.navigate(async () => {
  await page.click('a.result');
});

writeFileSync('flow-report.html', await flow.generateReport());
await browser.close();
```

**Tres modos de Lighthouse:**

1. **Navigation Mode**: Analiza pageload
   - ✅ Performance score
   - ✅ Web Vitals
   - ✅ PWA capabilities
   - ❌ No analiza SPAs o form submissions

2. **Timespan Mode**: Analiza período de tiempo con interacciones
   - ✅ Layout shifts durante interacciones
   - ✅ JavaScript execution time
   - ❌ No provee performance score
   - ❌ No analiza métricas basadas en momentos (LCP)

3. **Snapshot Mode**: Analiza estado actual de la página
   - ✅ Accesibilidad en cualquier estado
   - ✅ Best practices
   - ❌ No analiza performance

### 1.4 Web Vitals en React

**Core Web Vitals:**

**LCP (Largest Contentful Paint)** - Velocidad de carga
- **Objetivo**: < 2.5s
- **Bueno**: < 2.5s
- **Necesita mejora**: 2.5s - 4.0s
- **Pobre**: > 4.0s

**FID (First Input Delay)** → **INP (Interaction to Next Paint)** [Nueva métrica]
- **FID Objetivo**: < 100ms
- **INP Objetivo**: < 200ms
- **Bueno**: < 200ms
- **Necesita mejora**: 200ms - 500ms
- **Pobre**: > 500ms

**CLS (Cumulative Layout Shift)** - Estabilidad visual
- **Objetivo**: < 0.1
- **Bueno**: < 0.1
- **Necesita mejora**: 0.1 - 0.25
- **Pobre**: > 0.25

**Implementación en React:**

```bash
npm install web-vitals
```

```jsx
// reportWebVitals.js
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

function sendToAnalytics({ name, delta, value, id }) {
  // Enviar a tu servicio de analytics
  console.log({ name, delta, value, id });
  
  // Ejemplo con Google Analytics
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
    event_label: id,
    non_interaction: true,
  });
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onINP(sendToAnalytics); // Nueva métrica
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

```jsx
// index.js
import { createRoot } from 'react-dom/client';
import App from './App';
import { reportWebVitals } from './reportWebVitals';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Medir web vitals
reportWebVitals();
```

**Optimizaciones específicas por métrica:**

**Para mejorar LCP:**
```jsx
// ❌ Malo - Lazy loading de imagen hero
<img loading="lazy" src="hero.jpg" />

// ✅ Bueno - Eager loading + preload
<link rel="preload" as="image" href="hero.jpg" />
<img loading="eager" src="hero.jpg" />

// ✅ Bueno - Optimizar imágenes críticas
<img 
  src="hero.jpg" 
  srcSet="hero-320w.jpg 320w, hero-768w.jpg 768w"
  sizes="(max-width: 768px) 100vw, 768px"
/>
```

**Para mejorar INP/FID:**
```jsx
// ❌ Malo - Mucho JavaScript en main thread
function handleClick() {
  const result = heavyComputation(largeData);
  setData(result);
}

// ✅ Bueno - Web Worker
const worker = new Worker('computation.worker.js');

function handleClick() {
  worker.postMessage(largeData);
  worker.onmessage = (e) => setData(e.data);
}

// ✅ Bueno - Debouncing/Throttling
import { useDeferredValue, useTransition } from 'react';

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  
  // deferredQuery se actualiza con menor prioridad
  const results = search(deferredQuery);
  
  return (
    <div style={{ opacity: isPending ? 0.5 : 1 }}>
      {results.map(r => <Result key={r.id} {...r} />)}
    </div>
  );
}
```

**Para mejorar CLS:**
```jsx
// ❌ Malo - Sin dimensiones
<img src="photo.jpg" />

// ✅ Bueno - Con aspect ratio
<img 
  src="photo.jpg" 
  width="640" 
  height="480"
  style={{ width: '100%', height: 'auto' }}
/>

// ✅ Bueno - Con CSS aspect-ratio
<div style={{ aspectRatio: '16/9' }}>
  <img src="photo.jpg" style={{ width: '100%', height: '100%' }} />
</div>

// ❌ Malo - Contenido inyectado dinámicamente sin espacio reservado
function AdBanner() {
  return <div>{/* ad loads here */}</div>;
}

// ✅ Bueno - Espacio reservado
function AdBanner() {
  return (
    <div style={{ minHeight: '250px' }}>
      {/* ad loads here */}
    </div>
  );
}
```

---

## 2. Re-render Debugging

### 2.1 Why Did You Render

**Instalación:**
```bash
npm install @welldone-software/why-did-you-render --save-dev
```

**Setup para React 19:**

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development',
      importSource: '@welldone-software/why-did-you-render',
    }]
  ]
};
```

**Configuración:**

```jsx
// wdyr.js
/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true, // Rastrea todos los componentes puros
    trackHooks: true, // Rastrea hooks
    trackExtraHooks: [
      // Rastrea custom hooks como useSelector
      [require('react-redux'), 'useSelector']
    ],
    logOwnerReasons: true, // Muestra por qué el componente padre re-renderizó
    collapseGroups: true, // Colapsa grupos en consola
  });
}
```

```jsx
// index.js
import './wdyr'; // ← PRIMERA importación
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

**Uso:**

```jsx
// Opción 1: Trackear componentes específicos
function BigList(props) {
  return <div>{/* ... */}</div>;
}
BigList.whyDidYouRender = true;

// Opción 2: Con configuración avanzada
BigList.whyDidYouRender = {
  logOnDifferentValues: true, // Log incluso con props diferentes
  customName: 'My Big List' // Nombre personalizado en logs
};

// Opción 3: Con trackAllPureComponents
const BigList = React.memo(function BigList(props) {
  return <div>{/* ... */}</div>;
});
// Se trackeará automáticamente si trackAllPureComponents: true
```

**Ejemplo de output:**

```
BigList Re-rendered because of props changes:
  Different objects with same value in props.items:
    (prev) [{id: 1, name: 'Item 1'}] !== (next) [{id: 1, name: 'Item 1'}]
    
  Different functions in props.onClick:
    (prev) onClick: ƒ () !== (next) onClick: ƒ ()

Why did the parent re-render?
  Parent.whyDidYouRender = true
  Different state.count: 1 !== 2
```

### 2.2 React.memo - Cuándo y Cómo Usar

**Concepto básico:**
`React.memo` es un HOC que memoriza un componente basándose en shallow comparison de props.

**Cuándo usar:**

✅ **SÍ usar React.memo cuando:**
- Componente renderiza frecuentemente con las mismas props
- Componente es computacionalmente costoso
- Componente es grande y renderiza muchos elementos
- Props son primitivos o referencias estables

❌ **NO usar React.memo cuando:**
- Componente es pequeño y rápido
- Props cambian frecuentemente
- Costo de comparación > costo de re-render
- El componente casi siempre recibe props nuevas

**Ejemplos:**

```jsx
// ❌ ANTES - Re-render innecesario
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveList name={name} />
    </div>
  );
}

function ExpensiveList({ name }) {
  // Este componente re-renderiza cada vez que count cambia
  // aunque name no cambió
  const items = expensiveComputation(name); // Slow!
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}
```

```jsx
// ✅ DESPUÉS - Con React.memo
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <ExpensiveList name={name} />
    </div>
  );
}

// Ahora solo re-renderiza cuando name cambia
const ExpensiveList = memo(function ExpensiveList({ name }) {
  const items = expensiveComputation(name);
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
});
```

**React.memo con comparación personalizada:**

```jsx
const MyComponent = memo(
  function MyComponent({ user, settings }) {
    return <div>{user.name} - {settings.theme}</div>;
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    // Return true si props son iguales (NO re-renderizar)
    // Return false si props son diferentes (SÍ re-renderizar)
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.settings.theme === nextProps.settings.theme
    );
  }
);
```

**Anti-patrón común:**

```jsx
// ❌ MALO - React.memo inútil
const List = memo(function List({ items }) {
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  // items es un array NUEVO cada render!
  const items = [1, 2, 3]; // ← Problema aquí
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <List items={items} /> {/* Re-renderiza siempre */}
    </div>
  );
}

// ✅ BUENO - Estabilizar la referencia
function Parent() {
  const [count, setCount] = useState(0);
  const items = useMemo(() => [1, 2, 3], []); // ← Solución
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      <List items={items} /> {/* Solo renderiza una vez */}
    </div>
  );
}
```

### 2.3 useMemo - Debugging y Mejores Prácticas

**Cuándo usar useMemo:**

✅ **SÍ usar cuando:**
- Computación costosa (> 1ms)
- Valor pasado a componente memoizado
- Valor usado como dependencia de otro hook
- Crear objetos/arrays para props de componentes memo

❌ **NO usar cuando:**
- Computación simple/barata
- Valor usado solo en JSX
- "Optimización prematura"

**Ejemplos:**

```jsx
// ❌ ANTES - Computación costosa en cada render
function TodoList({ todos, tab }) {
  const visibleTodos = filterTodos(todos, tab); // Slow! Se ejecuta cada render
  
  return (
    <ul>
      {visibleTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

```jsx
// ✅ DESPUÉS - Con useMemo
import { useMemo } from 'react';

function TodoList({ todos, tab }) {
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab), // Solo se ejecuta si todos o tab cambian
    [todos, tab]
  );
  
  return (
    <ul>
      {visibleTodos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**Debugging useMemo:**

```jsx
// Medir si useMemo está ayudando
console.time('filter array');
const visibleTodos = useMemo(() => {
  console.log('Computing visible todos...'); // ← Solo aparece cuando se recalcula
  return filterTodos(todos, tab);
}, [todos, tab]);
console.timeEnd('filter array');

// Primera ejecución: "filter array: 15.234ms"
// Re-renders sin cambios en deps: "filter array: 0.001ms" ← useMemo funcionando!
```

**Patrón común: Estabilizar props para React.memo**

```jsx
// ❌ PROBLEMA
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);
  
  // person es un NUEVO objeto cada render
  const person = { name, age };
  
  return <Profile person={person} />; // Profile siempre re-renderiza
}

const Profile = memo(function Profile({ person }) {
  console.log('Rendering Profile...'); // Se ejecuta cada render del padre
  return <div>{person.name} - {person.age}</div>;
});

// ✅ SOLUCIÓN
function Page() {
  const [name, setName] = useState('Taylor');
  const [age, setAge] = useState(42);
  
  // person solo se recrea si name o age cambian
  const person = useMemo(
    () => ({ name, age }),
    [name, age]
  );
  
  return <Profile person={person} />; // Profile solo re-renderiza cuando person cambia
}

const Profile = memo(function Profile({ person }) {
  console.log('Rendering Profile...'); // Solo cuando person realmente cambia
  return <div>{person.name} - {person.age}</div>;
});
```

**useMemo vs useCallback:**

```jsx
import { useMemo, useCallback } from 'react';

function ProductPage({ productId, referrer }) {
  const product = useData('/product/' + productId);

  // useMemo - Cachea el RESULTADO de la función
  const requirements = useMemo(() => {
    return computeRequirements(product); // ← Ejecuta y cachea resultado
  }, [product]);

  // useCallback - Cachea la FUNCIÓN misma
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]); // ← Cachea la función

  return (
    <div>
      <ShippingForm requirements={requirements} onSubmit={handleSubmit} />
    </div>
  );
}

// Equivalencia:
const fn = useCallback(() => computeSomething(), [deps]);
const fn = useMemo(() => () => computeSomething(), [deps]);
```

**Validación con ESLint:**

```js
// eslint plugin: eslint-plugin-react-hooks
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn" // Advierte sobre deps faltantes
  }
}

// ❌ Malo - useMemo sin retornar valor
function Component({ data }) {
  const processed = useMemo(() => {
    data.map(item => item * 2); // ← Falta return!
  }, [data]);

  return <div>{processed}</div>; // processed es undefined
}

// ✅ Bueno
function Component({ data }) {
  const processed = useMemo(() => {
    return data.map(item => item * 2); // ← Con return
  }, [data]);

  return <div>{processed}</div>;
}
```

### 2.4 useCallback - Casos de Uso y Pitfalls

**Cuándo usar useCallback:**

✅ **SÍ usar cuando:**
- Pasas función a componente memoizado
- Función es dependencia de otro hook
- Función se pasa a hook de terceros (useEffect, useSelector, etc)

❌ **NO usar cuando:**
- Función solo se usa en JSX
- Componente hijo no está memoizado
- Función es muy simple

**Ejemplos:**

```jsx
// ❌ ANTES - Función nueva cada render
function ProductPage({ productId, referrer }) {
  // handleSubmit es una NUEVA función cada render
  function handleSubmit(orderDetails) {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }

  return <ShippingForm onSubmit={handleSubmit} />;
}

// ShippingForm está memoizado, pero re-renderiza igual porque onSubmit cambia
const ShippingForm = memo(function ShippingForm({ onSubmit }) {
  console.log('Rendering ShippingForm...'); // Se ejecuta cada render del padre
  // ...
});
```

```jsx
// ✅ DESPUÉS - Con useCallback
import { useCallback } from 'react';

function ProductPage({ productId, referrer }) {
  // handleSubmit solo se recrea si productId o referrer cambian
  const handleSubmit = useCallback((orderDetails) => {
    post('/product/' + productId + '/buy', {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);

  return <ShippingForm onSubmit={handleSubmit} />;
}

// ShippingForm solo re-renderiza cuando handleSubmit realmente cambia
const ShippingForm = memo(function ShippingForm({ onSubmit }) {
  console.log('Rendering ShippingForm...'); // Solo cuando onSubmit cambia
  // ...
});
```

**Pitfall #1: useCallback sin memo es inútil**

```jsx
// ❌ MALO - useCallback sin sentido
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []);
  
  // Child NO está memoizado, así que re-renderiza igual
  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  console.log('Child rendering...'); // Se ejecuta cada render del padre
  return <button onClick={onClick}>Click</button>;
}

// ✅ BUENO - useCallback + memo
const Child = memo(function Child({ onClick }) {
  console.log('Child rendering...'); // Solo renderiza una vez
  return <button onClick={onClick}>Click</button>;
});
```

**Pitfall #2: Inline arrow function rompe memoización**

```jsx
// ❌ MALO - Inline arrow function
const handleClick = useCallback((item) => {
  onClick(item.id);
}, [onClick]);

return (
  <div>
    {processedData.map(item => (
      // Nueva función cada render! 
      <Item key={item.id} onClick={() => handleClick(item)} />
    ))}
  </div>
);

// ✅ BUENO - Pasar función directamente
const handleClick = useCallback((itemId) => {
  onClick(itemId);
}, [onClick]);

return (
  <div>
    {processedData.map(item => (
      <Item 
        key={item.id} 
        itemId={item.id}
        onClick={handleClick} 
      />
    ))}
  </div>
);

// En Item:
const Item = memo(function Item({ itemId, onClick }) {
  return (
    <button onClick={() => onClick(itemId)}>
      Click
    </button>
  );
});
```

**Pitfall #3: Dependencias incorrectas**

```jsx
// ❌ MALO - Dependencias faltantes
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  const fetchResults = useCallback(async () => {
    const data = await search(query); // ← query usado pero no en deps
    setResults(data);
  }, []); // ← deps vacío! Siempre usa query inicial
  
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);
  
  // ...
}

// ✅ BUENO - Con todas las dependencias
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  const fetchResults = useCallback(async () => {
    const data = await search(query);
    setResults(data);
  }, [query]); // ← query en deps
  
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);
  
  // ...
}

// ✅ MEJOR - Sin useCallback innecesario
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    async function fetchResults() {
      const data = await search(query);
      setResults(data);
    }
    fetchResults();
  }, [query]); // Solo query en deps
  
  // ...
}
```

**React Compiler (Futuro):**

Con React Compiler, no necesitarás memo/useMemo/useCallback manual:

```jsx
// ❌ Manualmente optimizado (presente)
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data, onClick }) {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  const handleClick = useCallback((item) => {
    onClick(item.id);
  }, [onClick]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={() => handleClick(item)} />
      ))}
    </div>
  );
});

// ✅ Automáticamente optimizado (con React Compiler)
function ExpensiveComponent({ data, onClick }) {
  const processedData = expensiveProcessing(data);

  const handleClick = (item) => {
    onClick(item.id);
  };

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} onClick={() => handleClick(item)} />
      ))}
    </div>
  );
}
// React Compiler aplica optimizaciones automáticamente
```

---

## 3. Bundle Size y Code Splitting

### 3.1 Análisis de Bundle

**Con Vite (recomendado):**

```bash
# Instalar plugin
npm install --save-dev rollup-plugin-visualizer

# vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // Abre automáticamente el reporte
      gzipSize: true, // Muestra tamaño gzipped
      brotliSize: true, // Muestra tamaño brotli
      filename: './dist/stats.html', // Output del reporte
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendors grandes
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-lib': ['@mui/material', '@emotion/react'],
        },
      },
    },
  },
});

# Build y ver análisis
npm run build
```

**Con Webpack:**

```bash
npm install --save-dev webpack-bundle-analyzer

# webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Genera HTML estático
      openAnalyzer: true,
      reportFilename: 'bundle-report.html',
    }),
  ],
};
```

**Source Map Explorer (agnóstico):**

```bash
npm install --save-dev source-map-explorer

# package.json
{
  "scripts": {
    "analyze": "source-map-explorer 'dist/**/*.js'"
  }
}

npm run build
npm run analyze
```

### 3.2 React.lazy y Suspense

**Uso básico:**

```jsx
// ❌ ANTES - Import estático (todo en bundle principal)
import HeavyComponent from './HeavyComponent';

function App() {
  return (
    <div>
      <HeavyComponent />
    </div>
  );
}
```

```jsx
// ✅ DESPUÉS - Lazy loading
import { lazy, Suspense } from 'react';

// Componente se carga solo cuando se renderiza
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

**Code splitting por ruta:**

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load de páginas
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading fallback reutilizable
function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner />
      <p>Loading page...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**Preloading (evitar waterfalls):**

```jsx
import { lazy } from 'react';

// Método manual de preload
const Dashboard = lazy(() => import('./Dashboard'));

// Precargar al hacer hover
function Navigation() {
  const preloadDashboard = () => {
    import('./Dashboard'); // Inicia la carga
  };
  
  return (
    <nav>
      <Link 
        to="/dashboard"
        onMouseEnter={preloadDashboard} // Precarga al hover
      >
        Dashboard
      </Link>
    </nav>
  );
}
```

**Con React Router (optimizado):**

```jsx
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// React Router maneja el lazy loading optimizado
const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('./pages/Home'),
  },
  {
    path: '/dashboard',
    lazy: async () => {
      const Dashboard = await import('./pages/Dashboard');
      return { Component: Dashboard.default };
    },
    // Preload de data en paralelo con código
    loader: async () => {
      const [Dashboard, data] = await Promise.all([
        import('./pages/Dashboard'),
        fetch('/api/dashboard-data').then(r => r.json()),
      ]);
      return data;
    },
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

**Error boundaries para lazy components:**

```jsx
import { Component, lazy, Suspense } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    console.error('Error loading component:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Failed to load component</h2>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <HeavyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3.3 Tree Shaking

**Optimización de imports:**

```jsx
// ❌ MALO - Importa toda la librería
import _ from 'lodash';
import * as MUI from '@mui/material';

function Component() {
  const sorted = _.sortBy(data, 'name'); // Importa TODO lodash
  return <MUI.Button>Click</MUI.Button>; // Importa TODO MUI
}

// ✅ BUENO - Named imports
import { sortBy } from 'lodash-es'; // Solo importa sortBy
import { Button } from '@mui/material'; // Solo importa Button

function Component() {
  const sorted = sortBy(data, 'name');
  return <Button>Click</Button>;
}

// ✅ MEJOR - Imports específicos
import sortBy from 'lodash-es/sortBy'; // Path específico
import Button from '@mui/material/Button'; // Path específico
```

**Configuración de Vite:**

```js
// vite.config.js
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Elimina console.logs
        dead_code: true, // Elimina código muerto
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar node_modules en chunks
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
});
```

**Side effects en package.json:**

```json
{
  "name": "my-library",
  "sideEffects": false, // Todo el código puede ser tree-shaken
  
  // O especificar archivos con side effects
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}
```

### 3.4 Estrategias de Code Splitting

**1. Route-based splitting:**
```jsx
// Cada ruta es un chunk separado
const routes = [
  { path: '/', component: lazy(() => import('./Home')) },
  { path: '/about', component: lazy(() => import('./About')) },
  { path: '/contact', component: lazy(() => import('./Contact')) },
];
```

**2. Component-based splitting:**
```jsx
// Componentes pesados lazy loaded
const HeavyChart = lazy(() => import('./HeavyChart'));
const HeavyEditor = lazy(() => import('./HeavyEditor'));
const HeavyMap = lazy(() => import('./HeavyMap'));
```

**3. Library splitting:**
```jsx
// vite.config.js - Separar librerías grandes
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts', 'd3'],
          'ui': ['@mui/material', '@emotion/react'],
          'forms': ['react-hook-form', 'zod'],
        },
      },
    },
  },
});
```

**4. Dynamic imports (import on interaction):**
```jsx
function ImageEditor() {
  const [Editor, setEditor] = useState(null);
  
  const loadEditor = async () => {
    const module = await import('./HeavyEditor');
    setEditor(() => module.default);
  };
  
  return (
    <div>
      {!Editor && <button onClick={loadEditor}>Open Editor</button>}
      {Editor && <Editor />}
    </div>
  );
}
```

**5. Prefetching y Preloading:**
```html
<!-- En HTML -->
<link rel="prefetch" href="/dashboard-chunk.js" />
<link rel="preload" href="/critical-chunk.js" as="script" />
```

```jsx
// Programático
function Navigation() {
  useEffect(() => {
    // Prefetch después de idle
    requestIdleCallback(() => {
      import('./Dashboard'); // Prefetch
    });
  }, []);
  
  return <nav>{/* ... */}</nav>;
}
```

---

## 4. Virtual Lists

### 4.1 react-window

**Instalación:**
```bash
npm install react-window
```

**FixedSizeList - Lista con items de altura fija:**

```jsx
import { FixedSizeList } from 'react-window';

// ❌ ANTES - Lista normal (renderiza 10,000 items)
function SlowList({ items }) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} style={{ height: 35 }}>
          {item}
        </div>
      ))}
    </div>
  );
}

// ✅ DESPUÉS - Lista virtualizada (renderiza solo ~20 items visibles)
function FastList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  );

  return (
    <FixedSizeList
      height={600} // Altura del contenedor
      itemCount={items.length} // Total de items
      itemSize={35} // Altura de cada item
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// Uso
const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);
<FastList items={items} />;
```

**VariableSizeList - Items con altura variable:**

```jsx
import { VariableSizeList } from 'react-window';

function VariableList({ items }) {
  // Función que devuelve la altura de cada item
  const getItemSize = (index) => {
    // Items pares más altos que impares
    return index % 2 === 0 ? 50 : 35;
  };

  const Row = ({ index, style }) => (
    <div style={style}>
      <strong>Item {items[index].id}</strong>
      <p>{items[index].content}</p>
    </div>
  );

  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={getItemSize} // ← Función que calcula altura
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

**Grid - Virtualización 2D:**

```jsx
import { FixedSizeGrid } from 'react-window';

function VirtualGrid({ data }) {
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      Cell [{rowIndex}, {columnIndex}]
    </div>
  );

  return (
    <FixedSizeGrid
      columnCount={1000} // Número de columnas
      columnWidth={100} // Ancho de columna
      height={600}
      rowCount={1000} // Número de filas
      rowHeight={35} // Altura de fila
      width={800}
    >
      {Cell}
    </FixedSizeGrid>
  );
}
```

**Con scroll programático:**

```jsx
import { useRef } from 'react';
import { FixedSizeList } from 'react-window';

function ScrollableList({ items }) {
  const listRef = useRef(null);

  const scrollToItem = (index) => {
    listRef.current?.scrollToItem(index, 'center');
  };

  const Row = ({ index, style }) => (
    <div style={style}>{items[index]}</div>
  );

  return (
    <div>
      <button onClick={() => scrollToItem(500)}>
        Scroll to item 500
      </button>
      <FixedSizeList
        ref={listRef}
        height={600}
        itemCount={items.length}
        itemSize={35}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

**Con overscan (pre-renderizar items fuera del viewport):**

```jsx
<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
  width="100%"
  overscanCount={5} // ← Renderiza 5 items extra arriba y abajo
>
  {Row}
</FixedSizeList>
```

**Callbacks útiles:**

```jsx
import { useState, useCallback } from 'react';
import { FixedSizeList } from 'react-window';

function ObservableList({ items }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, stop: 0 });

  const onItemsRendered = useCallback(({ 
    visibleStartIndex, 
    visibleStopIndex 
  }) => {
    setVisibleRange({ 
      start: visibleStartIndex, 
      stop: visibleStopIndex 
    });
    console.log(`Showing items ${visibleStartIndex} to ${visibleStopIndex}`);
  }, []);

  const Row = ({ index, style }) => (
    <div style={style}>{items[index]}</div>
  );

  return (
    <div>
      <p>Visible: {visibleRange.start} - {visibleRange.stop}</p>
      <FixedSizeList
        height={600}
        itemCount={items.length}
        itemSize={35}
        width="100%"
        onItemsRendered={onItemsRendered} // ← Callback
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
```

### 4.2 react-virtualized vs react-window

**Comparación:**

| Característica | react-window | react-virtualized |
|---------------|--------------|-------------------|
| **Bundle size** | 6.4 KB | 71.5 KB |
| **Performance** | ⚡⚡⚡ | ⚡⚡ |
| **Features** | Esenciales | Completo |
| **Mantenimiento** | Activo | Maintenance mode |
| **Recomendación** | ✅ Nuevos proyectos | Legacy |

**react-window es el sucesor moderno de react-virtualized.**

**Características únicas de react-virtualized:**
- AutoSizer (detecta tamaño del contenedor)
- CellMeasurer (mide altura dinámica)
- InfiniteLoader (infinite scroll)
- WindowScroller (scroll de página)

**Migración de react-virtualized a react-window:**

```jsx
// ❌ react-virtualized
import { List } from 'react-virtualized';

<List
  width={800}
  height={600}
  rowCount={items.length}
  rowHeight={35}
  rowRenderer={({ index, key, style }) => (
    <div key={key} style={style}>
      {items[index]}
    </div>
  )}
/>

// ✅ react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  width={800}
  height={600}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList>
```

### 4.3 Performance con Listas Grandes

**Benchmark: 10,000 items**

| Método | Initial Render | Scroll (60fps) | Memory |
|--------|---------------|---------------|--------|
| Normal list | 2,500ms | ❌ Janky | 50 MB |
| react-window | 45ms | ✅ Smooth | 2 MB |
| react-virtualized | 65ms | ✅ Smooth | 3 MB |

**Ejemplo completo optimizado:**

```jsx
import { memo, useCallback } from 'react';
import { FixedSizeList } from 'react-window';

// Memoizar el componente de fila
const Row = memo(({ index, style, data }) => {
  const item = data[index];
  
  return (
    <div style={style} className="list-item">
      <img src={item.avatar} alt="" width="40" height="40" />
      <div>
        <strong>{item.name}</strong>
        <p>{item.email}</p>
      </div>
    </div>
  );
});

function OptimizedList({ items }) {
  // Memoizar el renderizado de filas
  const renderRow = useCallback((props) => {
    return <Row {...props} data={items} />;
  }, [items]);

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={60}
      width="100%"
      overscanCount={3}
    >
      {renderRow}
    </FixedSizeList>
  );
}

// Uso con 10,000 items
const hugeList = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `User ${i}`,
  email: `user${i}@example.com`,
  avatar: `https://i.pravatar.cc/150?img=${i % 70}`,
}));

<OptimizedList items={hugeList} />;
```

**Infinite scrolling con react-window:**

```jsx
import { useState, useEffect, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreItems = useCallback(async (startIndex, stopIndex) => {
    console.log(`Loading items ${startIndex} to ${stopIndex}`);
    
    // Simular API call
    const newItems = await fetchItems(startIndex, stopIndex);
    
    setItems(prev => [...prev, ...newItems]);
    
    if (newItems.length === 0) {
      setHasMore(false);
    }
  }, []);

  const isItemLoaded = (index) => !hasMore || index < items.length;

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return <div style={style}>Loading...</div>;
    }

    return (
      <div style={style}>
        {items[index].name}
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasMore ? items.length + 1 : items.length}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={600}
          itemCount={hasMore ? items.length + 1 : items.length}
          itemSize={35}
          onItemsRendered={onItemsRendered}
          ref={ref}
          width="100%"
        >
          {Row}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```

**Responsive con AutoSizer:**

```jsx
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

function ResponsiveList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index]}</div>
  );

  return (
    <div style={{ height: '100vh' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height} // ← Auto-detectado
            width={width}   // ← Auto-detectado
            itemCount={items.length}
            itemSize={35}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}
```

---

## Resumen de Mejores Prácticas

### ✅ DO's

1. **Profiling primero**: Siempre mide antes de optimizar
2. **React DevTools Profiler**: Para identificar componentes lentos
3. **Web Vitals**: Implementa en producción para datos reales
4. **React.memo**: Solo en componentes costosos con props estables
5. **useMemo/useCallback**: Solo para computaciones costosas o con memo
6. **Code splitting**: Por rutas y componentes pesados
7. **Virtual lists**: Para listas > 100 items
8. **Bundle analysis**: Regularmente en CI/CD
9. **Tree shaking**: Named imports específicos
10. **Lighthouse**: Auditorías periódicas en CI

### ❌ DON'Ts

1. **No optimizar prematuramente**: Mide primero
2. **No memo todo**: Costo de comparación > costo de render
3. **No usar useMemo para valores simples**: Overhead innecesario
4. **No lazy load content above the fold**: Impacta LCP
5. **No ignorar el bundle size**: Monitorea en cada PR
6. **No usar console.log en producción**: Usa build flags
7. **No abusar de useCallback sin memo**: Es inútil
8. **No hacer code splitting excesivo**: Muchos chunks = muchos requests

---

## Herramientas de Monitoring en Producción

```jsx
// Integración con servicios de APM
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

function sendToAPM({ name, delta, value, id }) {
  // Sentry
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    message: `${name}: ${value}`,
    level: 'info',
  });

  // New Relic
  newrelic.addPageAction(name, {
    value: Math.round(delta),
    rating: getRating(name, value),
  });

  // Custom backend
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, delta, value, id }),
  });
}

// Inicializar
onCLS(sendToAPM);
onFID(sendToAPM);
onINP(sendToAPM);
onLCP(sendToAPM);
```

---

## Referencias

- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [web.dev - Web Vitals](https://web.dev/articles/vitals)
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)
- [React Window](https://github.com/bvaughn/react-window)
- [Lighthouse User Flows](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
