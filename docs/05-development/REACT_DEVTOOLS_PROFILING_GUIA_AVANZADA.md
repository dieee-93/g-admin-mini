# React DevTools y Profiling Avanzado - Guía Completa

## Tabla de Contenidos
1. [Instalación y Configuración](#instalación-y-configuración)
2. [Components Tab - Inspección Profunda](#components-tab---inspección-profunda)
3. [Profiler Tab - Análisis de Performance](#profiler-tab---análisis-de-performance)
4. [Configuraciones Avanzadas](#configuraciones-avanzadas)
5. [Solución de Problemas Comunes](#solución-de-problemas-comunes)
6. [Casos de Uso Prácticos](#casos-de-uso-prácticos)
7. [Mejores Prácticas](#mejores-prácticas)

---

## Instalación y Configuración

### Browser Extension (Recomendado)

**Chrome/Edge:**
```
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
```

**Firefox:**
```
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**Verificación:**
Una vez instalado, verás dos pestañas nuevas en DevTools:
- ⚛️ **Components** - Para inspeccionar el árbol de componentes
- 📊 **Profiler** - Para análisis de rendimiento

### Standalone App (Safari y otros)

```bash
# Instalación global
npm install -g react-devtools

# O con proyecto
npm install --save-dev react-devtools

# Iniciar
npx react-devtools
```

**Conectar la app:**
```html
<!doctype html>
<html lang="en">
  <head>
    <!-- PRIMERO, antes de cualquier otro script -->
    <script src="http://localhost:8097"></script>
```

**⚠️ IMPORTANTE:** Remover antes de producción.

### Builds de Profiling

Para obtener datos más detallados en producción:

```javascript
// vite.config.ts o webpack.config.js
export default {
  resolve: {
    alias: {
      'react-dom/client': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
}
```

---

## Components Tab - Inspección Profunda

### 1. Navegación y Selección de Componentes

#### Métodos de Selección:

**A. Selector de Elementos (🔍)**
- Click en el ícono de selector
- Hover sobre elementos en la página
- Click para seleccionar y ver en DevTools

**B. Búsqueda (Ctrl/Cmd + F)**
```
MyComponent       → Busca por nombre
/my.*comp/i       → Regex case-insensitive
<button           → Busca por tipo de elemento
```

**C. Árbol de Componentes**
- Expande/colapsa con flechas
- Double-click para expandir toda la rama
- Right-click para opciones contextuales

### 2. Inspección de Props y State

#### Panel Derecho - Vista Detallada

```
┌─────────────────────────────────────┐
│ ComponentName                    ✨  │  ← Memo badge (si optimizado)
├─────────────────────────────────────┤
│ props                               │
│   ▼ user                            │
│       id: 123                       │
│       name: "Diego"                 │
│       email: "diego@example.com"    │
│   onClick: ƒ handleClick()          │  ← Funciones son clickables
│                                     │
│ state                               │
│   ▼ formData                        │
│       firstName: "John"             │
│       lastName: "Doe"               │
│   isLoading: false                  │
│                                     │
│ hooks                               │
│   State: false                      │  ← Hook index 0
│   Effect: ƒ ()                      │  ← Hook index 1
│   Context: {...}                    │  ← Hook index 2
└─────────────────────────────────────┘
```

#### Edición en Vivo

**Editar State:**
1. Click en el valor
2. Modificar (strings, numbers, booleans)
3. Enter para aplicar

```
Antes:  isLoading: false
        ↓ (click y editar)
Después: isLoading: true
```

**Editar Props (con limitaciones):**
- Solo en componentes que acepten cambios
- Útil para testing de UI states
- **No persiste** - se resetea en próximo render

**Editar Hooks:**
```
hooks
  State(0): "initial value"  ← Click para editar
          ↓
  State(0): "nuevo valor"    ← Componente re-renderiza
```

### 3. Inspección de Hooks

#### Vista Detallada de Hooks

```javascript
// Componente
function MyComponent() {
  const [count, setCount] = useState(0);           // Hook 0
  const [name, setName] = useState('Diego');       // Hook 1
  const theme = useContext(ThemeContext);          // Hook 2
  const memoValue = useMemo(() => calc(), [dep]);  // Hook 3
  const cbFunc = useCallback(() => {}, []);        // Hook 4
  
  useEffect(() => {
    // side effect
  }, [count]);                                     // Hook 5
  
  return <div>...</div>
}
```

**En DevTools verás:**
```
hooks
  ▼ State: 0                    ← useState(0)
      value: 0
      setter: ƒ setCount()
  ▼ State: "Diego"              ← useState('Diego')
      value: "Diego"
      setter: ƒ setName()
  Context: {theme: "dark"}      ← useContext
  Memo: 42                      ← useMemo result
  Callback: ƒ ()                ← useCallback
  ▼ Effect: ƒ ()                ← useEffect
      create: ƒ ()
      deps: [0]                 ← Dependencies array
```

**Debugging Hooks:**
- **Orden importa** - Hooks se identifican por índice
- **Dependencias visibles** - Ver qué causa re-ejecución
- **Valores cacheados** - Verificar si memo funciona

### 4. Source Code Navigation

#### Ir a Definición del Componente

**Método 1: Click en nombre**
```
ComponentName                    ← Click aquí
  └─ Abre: src/components/ComponentName.tsx:15
```

**Método 2: Botón "⚙️" Settings**
1. Settings → General
2. Enable "Open in editor"
3. Configure editor URL:

```
VS Code:
vscode://file/{path}:{line}:{column}

WebStorm:
webstorm://open?file={path}&line={line}

Sublime:
subl://open?url=file://{path}&line={line}
```

**Verificar en consola:**
```javascript
// Selecciona un componente en DevTools
$r.type            // → Function definition
$r.type.toString() // → Source code
```

### 5. Rendered By Tracking

#### ¿Qué componente renderizó este componente?

**Activar:**
1. Settings → General
2. ✅ "Show 'rendered by' information"

**Vista:**
```
┌─────────────────────────────────────┐
│ Button                              │
├─────────────────────────────────────┤
│ rendered by                         │
│   App → Dashboard → UserCard → Butt│
│         ↑                       ↑   │
│         Root              Current   │
└─────────────────────────────────────┘
```

**Usar para:**
- Encontrar re-renders innecesarios
- Entender flujo de datos
- Debug context propagation

### 6. Owners Tree

El **Owners Tree** muestra la jerarquía de ownership (no DOM):

```javascript
// Estructura
<App>                    // Owner: null
  <Layout>               // Owner: App
    {items.map(item =>   
      <Card key={item.id}>    // Owner: Layout (no el .map!)
        <Button />            // Owner: Card
      </Card>
    )}
  </Layout>
</App>
```

**En DevTools:**
```
Owner Tree:
  App
    Layout
      Card
        Button
```

**vs DOM Tree:**
```
DOM Tree:
  div (App)
    div (Layout)
      div (Card)
        button (Button)
```

**Por qué importa:**
- Context se propaga por ownership, no DOM
- Re-renders se propagan por ownership
- Debugging de props drilling

---

## Profiler Tab - Análisis de Performance

### 1. Grabando una Sesión de Profiling

#### Pasos Básicos:

```
1. Abrir Profiler Tab
2. Click 🔴 "Start Profiling"
3. Interactuar con la aplicación
4. Click ⏹️ "Stop Profiling"
5. Analizar resultados
```

#### Qué Graba:

- **Commits**: Cada actualización del DOM
- **Renders**: Qué componentes renderizaron
- **Durations**: Tiempo de renderizado
- **Reasons**: Por qué se renderizó (React 18+)

### 2. Flame Chart - Visualización Principal

#### Anatomía del Flame Chart:

```
Commit 1                    Commit 2                Commit 3
┌──────────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ App (10ms)          │   │ App (5ms)        │   │ App (15ms)       │
│ ┌────────────────┐  │   │ ┌────────────┐   │   │ ┌──────────────┐ │
│ │ Header (2ms)   │  │   │ │ Header     │   │   │ │ Header (8ms) │ │
│ └────────────────┘  │   │ │ (did not   │   │   │ └──────────────┘ │
│ ┌────────────────┐  │   │ │ render)    │   │   │ ┌──────────────┐ │
│ │ Content (8ms)  │  │   │ └────────────┘   │   │ │ Content (7ms)│ │
│ │ ┌────────────┐ │  │   │                  │   │ │ ┌──────────┐ │ │
│ │ │ List (6ms) │ │  │   │                  │   │ │ │ List(5ms)│ │ │
│ │ └────────────┘ │  │   │                  │   │ │ └──────────┘ │ │
│ └────────────────┘  │   │                  │   │ └──────────────┘ │
└──────────────────────┘   └──────────────────┘   └──────────────────┘

Colores:
 🟩 Verde  : Rápido (< 5ms)
 🟨 Amarillo: Medio (5-10ms)
 🟧 Naranja: Lento (10-20ms)
 🟥 Rojo   : Muy lento (> 20ms)
```

#### Interpretación:

**Ancho de Barra = Tiempo de Ejecución**
- Más ancho = más tiempo
- Incluye tiempo de hijos

**Jerarquía Vertical = Árbol de Componentes**
- Padres arriba
- Hijos debajo (indentados)

**Click en Barra:**
```
┌─────────────────────────────────────┐
│ List                                │
│ Duration: 6.2ms                     │
│ Self time: 0.8ms                    │
│ Children time: 5.4ms                │
│                                     │
│ Why did this render?                │
│ • Props changed: items              │
│ • Parent component rendered         │
│                                     │
│ Rendered 15 items                   │
└─────────────────────────────────────┘
```

### 3. Ranked Chart - Componentes Ordenados

#### Vista por Duración:

```
Ranked View - Commit 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
List           ████████████████  16.2ms
ProductCard    ███████████       11.5ms
Sidebar        ████████           8.3ms
Header         ███                3.1ms
Button         ██                 2.0ms
Icon           █                  0.8ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Usar para:

1. **Identificar hotspots** - Componentes más lentos
2. **Priorizar optimizaciones** - Top 3-5 componentes
3. **Comparar commits** - ¿Mejoró después del cambio?

**Filtrar por componente:**
```
Search: ProductCard
→ Muestra solo renders de ProductCard en todos los commits
```

### 4. Analizando Renders y Commits

#### Navegación Entre Commits:

```
◀️ ▶️  Flechas: Commit anterior/siguiente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit 1 of 12    Duration: 24.5ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Detalles del Commit:

**Commit Summary:**
- Total duration: Tiempo total
- Component count: Cuántos componentes renderizaron
- Commit time: Cuándo ocurrió

**Component Details:**
```javascript
// Click en componente para ver:
{
  componentName: "ProductList",
  actualDuration: 16.2,      // Tiempo real de render
  baseDuration: 18.5,        // Tiempo sin memoization
  startTime: 1234.5,         // Timestamp de inicio
  commitTime: 1250.7,        // Timestamp de commit
  
  // React 18+
  interactions: Set(1) {...}, // Qué interacción causó esto
  
  // Why did it render?
  reasons: [
    "Props changed",
    "Hook changed: useState",
    "Parent component rendered"
  ]
}
```

### 5. Filtrado por Duración

#### Filtro de Duración Mínima:

```
⚙️ Settings → Profiler
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hide commits below: [___5___] ms

→ Solo muestra commits > 5ms
→ Ignora micro-optimizaciones
→ Enfócate en problemas reales
```

#### Estrategia de Filtrado:

```
1ra Pasada: No filter
   → Ver panorama general
   
2da Pasada: Filter > 10ms
   → Identificar problemas serios
   
3ra Pasada: Filter componente específico
   → Deep dive en componente problemático
```

### 6. Identificar Componentes Problemáticos

#### Checklist de Análisis:

**🔴 RED FLAGS:**

1. **Renderiza en CADA commit**
```
Commits: 1  2  3  4  5  6  7  8
Renders: ✓  ✓  ✓  ✓  ✓  ✓  ✓  ✓  ← PROBLEMA!

→ Posiblemente missing memo
→ Props cambian innecesariamente
```

2. **Duration inconsistente**
```
Commit 1: 2ms   ✅
Commit 2: 45ms  🔴 ← ¿Por qué?
Commit 3: 3ms   ✅
Commit 4: 40ms  🔴 ← Patrón

→ Lazy initialization en render
→ Cálculos costosos sin memo
```

3. **Muchos hijos rerenderean innecesariamente**
```
Parent (2ms)
  Child1 (1ms) ← renderizó
  Child2 (1ms) ← renderizó
  Child3 (1ms) ← renderizó
  ...
  Child50 (1ms) ← renderizó

→ Todos los hijos renderizan aunque no cambiaron
→ Falta React.memo()
```

4. **Base Duration >> Actual Duration**
```
Actual:  5ms
Base:    45ms
Improvement: 89%! 🎉

→ Memoization funcionando bien
→ Mantener optimizaciones
```

**vs**

```
Actual:  45ms
Base:    46ms
Improvement: 2%  😐

→ Memoization NO ayuda
→ Problema es el render en sí
```

#### Patrones de Problemas Comunes:

**Pattern 1: Cascading Re-renders**
```
App renders → Everything renders

Solución:
- React.memo() en componentes hoja
- Split state más granularmente
- Context separation
```

**Pattern 2: Expensive Renders**
```
List component: 50ms per render
  → Rendering 1000 items
  
Solución:
- Virtualization (react-window)
- Pagination
- Lazy loading
```

**Pattern 3: Redundant Renders**
```
Component renders 3 times per interaction

Solución:
- Batching (React 18 auto-batches)
- useDeferredValue para updates no urgentes
- useTransition para navegación
```

### 7. Timeline Profiler (React 18+)

**Beta Feature - Activar:**
```
React DevTools → Settings → Profiler
✅ Enable Timeline Profiler
```

**Muestra:**
- Cuándo se schedulearon updates
- Cuándo React trabajó en updates
- Suspense boundaries
- Transition tracking

```
Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     User Click          React Work    Commit
        ↓                    ↓            ↓
        │                    ┌──────┐     │
        ●────────────────────┤      ├─────●
        │                    └──────┘     │
     10ms                  30ms        40ms
        
Suspended: ████████████     ← Waiting for data
Active:            ████████  ← React rendering
```

---

## Configuraciones Avanzadas

### 1. Highlight Updates - Detectar Re-renders

**Activar:**
```
⚙️ Settings → General
✅ Highlight updates when components render
```

**Visualización:**
```
Render → Flash de color en el componente:

🟦 Azul:    Render lento
🟩 Verde:   Render rápido
🟨 Amarillo: Render medio
```

**Usar para:**
- Ver qué rerenderiza al interactuar
- Identificar re-renders en cascada
- Validar que memo funciona

**Ejemplo Práctico:**
```javascript
// ANTES: Sin memo
function ExpensiveList({ items, onSelect }) {
  return items.map(item => <Item key={item.id} {...item} />)
}

// Interacción en otro componente
// → ExpensiveList parpadea (rerenderiza) 🔴

// DESPUÉS: Con memo
const ExpensiveList = memo(function ExpensiveList({ items, onSelect }) {
  return items.map(item => <Item key={item.id} {...item} />)
})

// Interacción en otro componente
// → ExpensiveList NO parpadea ✅
```

### 2. Component Filters

**Activar Filtros:**
```
⚙️ Settings → Components
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component Filters:

□ Hide components where...
  Type: [______________]     (regex)
  Location: [___________]    (regex)
  HOC: [________________]    (regex)

Common filters:
✅ /^Connect/              → Hide Redux connect()
✅ /^ForwardRef/           → Hide forwardRef wrappers
✅ /node_modules/          → Hide library internals
```

**Filtros Predefinidos:**
```javascript
// Ocultar React Router internals
/^Router|^Route|^Switch/

// Ocultar emotion styled components
/^Emotion/

// Ocultar HOCs de Redux
/^Connect/

// Solo mostrar tus componentes
/^(?!.*node_modules)/
```

**Uso Avanzado:**
```
Escenario: Debugging app grande

1. Filtrar todo menos módulo actual:
   Location: /src/modules/products/

2. Profiling de flujo específico:
   Type: /^Product|^Cart|^Checkout/

3. Excluir wrappers de terceros:
   ✅ Hide components from libraries
```

### 3. Debugging Mode

**Activar:**
```javascript
// En tu app (development only!)
if (import.meta.env.DEV) {
  // Habilita trazas de stack más detalladas
  window.__REACT_DEVTOOLS_BREAK_ON_CONSOLE_ERRORS__ = true;
  
  // Pausar en warnings
  window.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = true;
}
```

**Strict Mode para detectar problemas:**
```javascript
// main.tsx
import { StrictMode } from 'react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**StrictMode hace:**
- Double-invoke de componentes (detectar side effects)
- Double-invoke de hooks (detectar problemas de deps)
- Warnings de APIs deprecated
- **Activity unmounts** (React 18+) - simula hide/show

**Console Groups para Debugging:**
```javascript
// Settings → Console
✅ Append component stacks to console logs
✅ Show inline warnings and errors

Resultado:
console.log('User clicked')
  in Button (at UserCard.tsx:45)
  in UserCard (at Dashboard.tsx:120)
  in Dashboard (at App.tsx:30)
  in App
```

### 4. Performance Marks

**User Timing API Integration:**
```javascript
// React automáticamente crea marks
performance.getEntriesByType('measure')
  .filter(e => e.name.startsWith('⚛️'))

/*
[
  {
    name: "⚛️ App",
    entryType: "measure",
    startTime: 1234.5,
    duration: 45.2
  },
  {
    name: "⚛️ ProductList",
    entryType: "measure", 
    startTime: 1240.1,
    duration: 38.7
  }
]
*/
```

**Ver en Chrome DevTools Performance:**
```
Performance tab → Record → Stop
→ User Timing section muestra React renders
```

---

## Solución de Problemas Comunes

### 1. Profiler No Graba

**Síntoma:** Click en 🔴 Record pero no registra commits

**Soluciones:**

#### A. Verificar Versión de React
```bash
npm list react react-dom

# Debe ser >= 16.5.0 para Profiler básico
# Debe ser >= 18.0.0 para Timeline y features avanzados
```

#### B. Build de Desarrollo vs Producción
```javascript
// Verificar en consola
console.log(React.version)        // "18.2.0"
console.log(process.env.NODE_ENV) // "development" ← Debe ser esto

// Si dice "production", el Profiler no tendrá datos completos
```

**Fix para Vite:**
```javascript
// vite.config.ts
export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('development')
  }
})
```

#### C. Profiling Build para Producción
```javascript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    },
  },
})
```

#### D. Extension Desactualizada
```
Chrome → Extensions → React Developer Tools
→ Verificar versión >= 4.28.0
→ Update si necesario
→ Restart Chrome
```

### 2. Información Incompleta

**Síntoma:** Commits aparecen pero sin detalles de componentes

#### A. Source Maps
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true  // ← CRÍTICO para nombres de componentes
  }
})
```

**Verificar:**
```javascript
// Si ves esto en DevTools:
<Anonymous> 
  <Anonymous>
    <t>  ← Componentes minimizados
    
// Necesitas source maps
```

#### B. Display Names
```javascript
// MALO: Arrow function anónima
export default () => <div>...</div>

// BUENO: Named function
export default function ProductCard() {
  return <div>...</div>
}

// BUENO: Display name explícito
const ProductCard = () => <div>...</div>
ProductCard.displayName = 'ProductCard'
export default ProductCard
```

#### C. Component Name Inference
```javascript
// ESLint rule para enforcer
{
  "rules": {
    "react/display-name": "error"
  }
}

// Vite plugin para auto-agregar display names
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-display-name']
        ]
      }
    })
  ]
}
```

### 3. Performance Overhead

**Síntoma:** App se vuelve lenta con DevTools abierto

#### A. Deshabilitar Features No Necesarios
```
Settings → General
□ Highlight updates when components render  ← Costoso
□ Show inline warnings and errors           ← Overhead
```

#### B. Component Filters
```
Settings → Components
✅ Hide React Router
✅ Hide Emotion
✅ Hide styled-components

→ Menos componentes = menos tracking
```

#### C. Profiler Sampling
```
Settings → Profiler
Sampling interval: [___5___] ms  ← Default: 1ms

→ Mayor intervalo = menos overhead
→ Pero menos precision
```

#### D. Deshabilitar Totalmente en Dev
```javascript
// .env.local
REACT_DEVTOOLS_DISABLED=true

// O en código
if (typeof window !== 'undefined') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function() {}
}
```

### 4. Components Tab Vacío

**Síntoma:** Extension instalada pero tab Components vacío

#### A. Chrome v101 y anterior
```
Problema conocido con Manifest V3
→ Upgrade Chrome a v102+
```

#### B. Service Worker Inactivo
```
1. chrome://extensions
2. React Developer Tools
   → "service worker (inactive)" 🔴
3. Disable → Enable extension
4. Reload página
5. Reabrir DevTools
```

#### C. React No Detectado
```javascript
// Verificar en consola
window.__REACT_DEVTOOLS_GLOBAL_HOOK__

// Debe existir. Si no:
// - Verificar que React esté cargado
// - Verificar que extension esté habilitada
// - Verificar permisos de extension
```

#### D. Iframe Issues
```html
<!-- Si app está en iframe -->
<!-- Abrir DevTools EN el iframe, no en parent -->

<!-- O usar standalone DevTools -->
<script src="http://localhost:8097"></script>
```

### 5. "Did Not Render" Falsos

**Síntoma:** Componente muestra "did not render" pero SÍ renderizó

#### Causas:

**A. Bailout Optimization**
```javascript
// React bailout si:
const MyComponent = memo(function MyComponent({ data }) {
  return <div>{data.name}</div>
})

// Props son shallow equal
// → React optimiza y no llama render function
// → DevTools dice "did not render" ✅ (correcto!)
```

**B. Same Element Return**
```javascript
function Parent() {
  const [state, setState] = useState(0)
  const child = useMemo(() => <Child />, [])
  
  return <div onClick={() => setState(s => s + 1)}>{child}</div>
}

// Parent renderiza, pero retorna MISMO elemento
// → Child no necesita renderizar
// → "did not render" ✅
```

**C. Context Optimization**
```javascript
const MyContext = createContext()

function Consumer() {
  const value = useContext(MyContext)
  return <div>{value.stable}</div>
}

// Si value.stable no cambió
// → Puede bailout
```

**No es un bug** - Es React siendo eficiente!

---

## Casos de Uso Prácticos

### Caso 1: Debugging Re-renders Excesivos

**Problema:** Lista con 100 items rerenderiza completamente en cada click

**Proceso de Debugging:**

#### 1. Activar Highlight Updates
```
Settings → General → ✅ Highlight updates
```

#### 2. Interactuar y Observar
```
Click botón → Toda la lista parpadea 🔴
→ TODOS los items rerenderean
```

#### 3. Profiler - Grabar Interacción
```
Profiler → 🔴 Record → Click botón → ⏹️ Stop

Resultado:
Commit 1: ProductList (45ms)
  Item (0.4ms) × 100 = 40ms 🔴
```

#### 4. Inspeccionar Componente
```javascript
// Encontrado en source:
function ProductList({ products, onSelect }) {
  return products.map(product => (
    <Item 
      key={product.id}
      product={product}
      onSelect={onSelect}  // ← 🔴 Nueva función cada render!
    />
  ))
}
```

#### 5. Aplicar Fix
```javascript
// FIX 1: Memo en Item
const Item = memo(function Item({ product, onSelect }) {
  return <div onClick={() => onSelect(product.id)}>...</div>
})

// FIX 2: Callback estable
function ProductList({ products, onSelect }) {
  const handleSelect = useCallback((id) => {
    onSelect(id)
  }, [onSelect])
  
  return products.map(product => (
    <Item 
      key={product.id}
      product={product}
      onSelect={handleSelect}  // ← ✅ Estable
    />
  ))
}
```

#### 6. Verificar Fix
```
Profiler → 🔴 Record → Click botón → ⏹️ Stop

Resultado MEJORADO:
Commit 1: ProductList (2ms)
  Item: "did not render" × 99
  Item (0.4ms) × 1           // ← Solo el clickeado!
  
Improvement: 45ms → 2ms (95% faster!) 🎉
```

### Caso 2: Identificar Componente Lento

**Problema:** Dashboard se siente lento al cargar

#### 1. Profiler - Grabar Load
```
Profiler → 🔴 Record → Reload page → ⏹️ Stop
```

#### 2. Ranked Chart
```
Ranked View - Commit 1 (Initial Mount)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard           ████████████████████  245ms
  AnalyticsWidget   ████████████████      187ms 🔴
  RecentActivity    ████                   45ms
  UserProfile       ██                     13ms
```

#### 3. Flame Chart - Deep Dive
```
Click en AnalyticsWidget:

Why did this render?
• Component mounted

Rendered 365 data points
Duration: 187ms
Self time: 12ms
Children time: 175ms  ← El problema está en hijos
```

#### 4. Inspeccionar Hijos
```
AnalyticsWidget (187ms)
  ChartContainer (5ms)
    LineChart (170ms) 🔴 🔴 🔴
      DataPoint × 365  ← Rendering TODOS
```

#### 5. Código Problemático
```javascript
// analytics-widget.tsx
function AnalyticsWidget({ data }) {
  return (
    <ChartContainer>
      <LineChart data={data} /> {/* 365 data points! */}
    </ChartContainer>
  )
}

function LineChart({ data }) {
  return (
    <svg>
      {data.map((point, i) => (
        <DataPoint key={i} {...point} />  // ← Cada uno 0.5ms
      ))}
    </svg>
  )
}
```

#### 6. Solución: Virtualization
```javascript
import { FixedSizeList } from 'react-window'

function LineChart({ data }) {
  // Solo renderizar puntos visibles
  const visiblePoints = useMemo(() => {
    return data.filter((_, i) => i % 5 === 0) // Sample cada 5
  }, [data])
  
  return (
    <svg>
      {visiblePoints.map(point => (
        <DataPoint key={point.id} {...point} />
      ))}
    </svg>
  )
}

// O mejor: Canvas rendering para muchos puntos
function LineChart({ data }) {
  const canvasRef = useRef()
  
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    // Draw con Canvas API (mucho más rápido)
    drawChart(ctx, data)
  }, [data])
  
  return <canvas ref={canvasRef} />
}
```

#### 7. Validar Mejora
```
Profiler → 🔴 Record → Reload → ⏹️ Stop

ANTES:
Dashboard: 245ms
  AnalyticsWidget: 187ms 🔴

DESPUÉS:
Dashboard: 68ms ✅
  AnalyticsWidget: 15ms ✅
  
85% faster! 🎉
```

### Caso 3: Context Causing Re-renders

**Problema:** Cambiar theme rerenderiza toda la app

#### 1. Highlight Updates
```
Toggle theme → Toda la app parpadea 🔴
```

#### 2. Components Tab - Rendered By
```
Button (en Footer)
rendered by:
  App → ThemeProvider → Layout → Footer → Button
                ↑
            Re-renderiza cuando theme cambia
```

#### 3. Problema en Context
```javascript
// theme-provider.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)  // ← 🔴 Unrelated state!
  
  const value = {
    theme,
    setTheme,
    user,        // ← 🔴 Causa re-renders innecesarios
    setUser
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
```

#### 4. Fix: Split Contexts
```javascript
// theme-context.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  
  const value = useMemo(() => ({
    theme,
    setTheme
  }), [theme])
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// user-context.tsx  
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user])
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

// app.tsx
<ThemeProvider>
  <UserProvider>
    <App />
  </UserProvider>
</ThemeProvider>
```

#### 5. Resultado
```
Toggle theme → Solo componentes usando theme parpadean ✅
Update user → Solo componentes usando user parpadean ✅
```

### Caso 4: useMemo No Está Funcionando

**Problema:** Agregaste useMemo pero no ves mejora

#### 1. Profiler - Verificar Base vs Actual
```
ExpensiveCalculation component:
  Actual Duration: 45ms  🔴
  Base Duration: 46ms
  
Improvement: 2% 😐 ← useMemo NO ayuda
```

#### 2. Inspeccionar Hooks
```
hooks
  Memo: {...}         ← useMemo result
    value: {...}
    deps: [obj]       ← 🔴 Objeto nuevo cada render!
```

#### 3. Código Problemático
```javascript
function Dashboard() {
  const config = { theme: 'dark' }  // ← 🔴 Nuevo cada render
  
  const result = useMemo(() => {
    return expensiveCalculation(config)
  }, [config])  // ← Siempre diferente!
  
  return <Display result={result} />
}
```

#### 4. Fix
```javascript
function Dashboard() {
  // FIX 1: useMemo para config también
  const config = useMemo(() => ({ 
    theme: 'dark' 
  }), [])
  
  const result = useMemo(() => {
    return expensiveCalculation(config)
  }, [config])  // ← Ahora estable!
  
  return <Display result={result} />
}

// O FIX 2: Depender de valores primitivos
function Dashboard() {
  const theme = 'dark'  // ← Primitivo, estable
  
  const result = useMemo(() => {
    return expensiveCalculation({ theme })
  }, [theme])  // ← Estable!
  
  return <Display result={result} />
}
```

#### 5. Verificar Fix
```
Profiler:
  Actual Duration: 2ms   ✅
  Base Duration: 46ms
  
Improvement: 95% 🎉
```

---

## Mejores Prácticas

### 1. Workflow de Profiling

**Proceso Recomendado:**

```
1. Baseline
   ├─ Grabar sesión SIN optimizaciones
   ├─ Identificar top 3-5 componentes lentos
   └─ Documentar métricas actuales

2. Hypothesize
   ├─ ¿Por qué es lento?
   ├─ ¿Qué optimización aplicar?
   └─ ¿Cuál es el impacto esperado?

3. Optimize
   ├─ Aplicar UNA optimización a la vez
   └─ Commit cambio

4. Measure
   ├─ Profiler → Grabar misma interacción
   ├─ Comparar con baseline
   └─ Validar mejora (>20% para justificar complejidad)

5. Iterate
   └─ Repetir para siguiente componente
```

### 2. Cuándo Optimizar

**NO optimizar:**
```
❌ Componente renderiza en < 5ms
❌ Renderiza solo en mount
❌ No está en critical path
❌ "Por las dudas"
```

**SÍ optimizar:**
```
✅ Profiler muestra > 16ms (60fps)
✅ Renderiza frecuentemente (ej: en scroll)
✅ Está en critical path (UX bloqueante)
✅ Metrics muestran impacto real
```

**Regla de Oro:**
```
Measure first, optimize second.
```

### 3. Métricas a Trackear

```javascript
// Guardar snapshots de profiling
const metrics = {
  initialLoad: {
    date: '2025-12-25',
    totalDuration: 245,
    commits: 3,
    components: [
      { name: 'Dashboard', duration: 187 },
      { name: 'Header', duration: 45 },
      // ...
    ]
  },
  afterOptimization: {
    date: '2025-12-26',
    totalDuration: 68,
    improvement: '72%',
    // ...
  }
}
```

**Track en CI:**
```javascript
// lighthouse-ci.json
{
  "ci": {
    "collect": {
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance"]
      }
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "interactive": ["error", {"maxNumericValue": 3000}]
      }
    }
  }
}
```

### 4. Documentation de Optimizaciones

```javascript
/**
 * ProductList component
 * 
 * PERFORMANCE NOTES:
 * - Memo'd to prevent re-renders when parent updates
 * - Items are virtualized (react-window) for lists > 50
 * - Last optimized: 2025-12-25
 * - Baseline: 187ms → Current: 15ms (92% improvement)
 * 
 * @see profiling-data.2025-12-25.json
 */
const ProductList = memo(function ProductList({ products }) {
  // ...
})
```

### 5. Testing Performance

```javascript
// product-list.test.tsx
import { unstable_trace as trace } from 'scheduler/tracing'

describe('ProductList performance', () => {
  it('should render 100 items in < 50ms', async () => {
    const items = generateMockItems(100)
    
    const start = performance.now()
    render(<ProductList items={items} />)
    const end = performance.now()
    
    expect(end - start).toBeLessThan(50)
  })
  
  it('should not re-render unchanged items', () => {
    const { rerender } = render(<ProductList items={items} />)
    
    // Spy en Item renders
    const renderSpy = jest.spyOn(Item, 'render')
    
    // Update con SAME items
    rerender(<ProductList items={items} />)
    
    expect(renderSpy).not.toHaveBeenCalled()
  })
})
```

---

## Recursos Adicionales

### Documentación Oficial
- [React DevTools - react.dev](https://react.dev/learn/react-developer-tools)
- [Profiler API](https://react.dev/reference/react/Profiler)
- [React Performance Tracks](https://react.dev/reference/dev-tools/react-performance-tracks)

### Artículos de Expertos
- [React Blog - Introducing the React Profiler](https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- Kent C. Dodds - Profile a React App for Performance
- Dan Abramov - Before You memo()

### Herramientas Complementarias
- **why-did-you-render** - Detecta re-renders innecesarios
- **react-window** / **react-virtualized** - Virtualización de listas
- **Lighthouse** - Performance metrics
- **Chrome Performance Tab** - User Timing API + React marks

### Browser Extensions
- React Developer Tools (Chrome/Firefox/Edge)
- Redux DevTools (para state debugging)
- React Query DevTools (para cache inspection)

---

## Quick Reference Card

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REACT DEVTOOLS CHEAT SHEET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPONENTS TAB
  🔍 Selector        Select component from page
  ⌘F Search          Find by name/regex
  $r                 Selected component in console
  
  Right Panel:
    props            Current props (editable)
    state            Current state (editable)
    hooks            Hooks values + deps
    rendered by      Component hierarchy
    source           Jump to code

PROFILER TAB
  🔴 Record          Start profiling
  ⏹️ Stop            End profiling
  ◀️ ▶️              Navigate commits
  
  Views:
    Flame Chart      Hierarchical view
    Ranked           Slowest components
    
  Metrics:
    Actual Duration  Real render time
    Base Duration    Time without memo
    
SETTINGS (⚙️)
  General:
    ✅ Highlight updates     Flash on render
    ✅ Component stack       Better errors
    ✅ Rendered by           Show hierarchy
    
  Components:
    Filter             Hide components
    
  Profiler:
    Hide commits       Duration threshold
    
CONSOLE UTILITIES
  $r                 Selected component
  $r.props           Component props
  $r.state           Component state (class)
  $r.type            Component function

KEYBOARD SHORTCUTS
  ⌘ + F              Search components
  ← →                Previous/next commit
  ↑ ↓                Navigate tree
  Enter              Expand/collapse

COLOR CODES
  🟩 Green           < 5ms (fast)
  🟨 Yellow          5-10ms (medium)
  🟧 Orange          10-20ms (slow)
  🟥 Red             > 20ms (very slow)
  
  ✨ Memo badge      Component optimized

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**Última actualización:** Diciembre 25, 2025
**Versión:** React 18.2+ | DevTools 4.28+
**Autor:** Guía Avanzada para g-mini Project
