# React DevTools Avanzado y Profiling - Guía Completa

**Sección 2.1 - Herramientas de Profiling y Debugging**

---

## Índice

1. [Components Tab Avanzado](#1-components-tab-avanzado)
2. [Profiler Tab](#2-profiler-tab)
3. [Settings y Configuraciones Avanzadas](#3-settings-y-configuraciones-avanzadas)
4. [Problemas Comunes y Soluciones](#4-problemas-comunes-y-soluciones)
5. [Recursos y Referencias](#5-recursos-y-referencias)

---

## 1. Components Tab Avanzado

### 1.1 Inspección Profunda de Props y State

El **Components Tab** es la herramienta principal para inspeccionar la estructura de tu aplicación React en tiempo real.

#### Características Principales

**Inspección de Props**
- **Visualización jerárquica**: Props anidados se muestran en estructura expandible
- **Tipos de datos**: Se identifican visualmente (objetos, arrays, funciones, primitivos)
- **Referencias de función**: Muestra `ƒ functionName()` para callbacks
- **Búsqueda rápida**: Usa Ctrl+F para buscar props específicos

**Visualización de State**
```
MyComponent
├─ props
│  ├─ userId: "123"
│  ├─ onSave: ƒ handleSave()
│  └─ config: {…}
│     ├─ theme: "dark"
│     └─ features: […]
└─ state
   ├─ isLoading: false
   ├─ data: null
   └─ error: undefined
```

**Inspección de Context**
- Aparece como una sección separada `context`
- Muestra todos los contexts que consume el componente
- Identifica el provider más cercano

#### Ejemplo Visual de Inspección

```
📦 UserProfile
│
├─ 📌 props
│  ├─ user: Object
│  │  ├─ id: "user-123"
│  │  ├─ name: "John Doe"
│  │  ├─ email: "john@example.com"
│  │  └─ preferences: Object {...}
│  ├─ onUpdate: ƒ handleUserUpdate()
│  └─ isEditable: true
│
├─ 🔧 state
│  ├─ isEditing: false
│  ├─ formData: null
│  └─ validationErrors: Array(0)
│
└─ 🌐 context
   ├─ ThemeContext: {theme: "dark", ...}
   └─ AuthContext: {user: {...}, ...}
```

---

### 1.2 Edición de State en Vivo

Una de las características más poderosas es la capacidad de **editar state directamente** desde DevTools.

#### Cómo Editar State

**Paso a paso**:
1. Selecciona el componente en el árbol
2. Navega a la sección `state` o `hooks`
3. Haz doble clic en el valor que deseas editar
4. Ingresa el nuevo valor
5. Presiona Enter para aplicar

**Tipos de Edición**:

```typescript
// Primitivos
isLoading: false → true (doble clic y cambiar)

// Strings
userName: "John" → "Jane" (edición directa)

// Números
count: 5 → 10 (edición directa)

// Booleanos
isActive: false → true (toggle automático en algunos casos)

// Objects y Arrays
// Se pueden editar valores anidados navegando en la jerarquía
user: {
  name: "John" → "Jane" (editar valor específico)
}
```

#### Casos de Uso Prácticos

**1. Testing de Estados de Carga**
```
// Cambiar manualmente:
isLoading: false → true
// Para ver el skeleton/loader sin hacer la request
```

**2. Testing de Estados de Error**
```
// Cambiar:
error: null → {message: "Test error"}
// Para ver el UI de error sin provocar el error real
```

**3. Testing de Permisos**
```
// Cambiar:
hasPermission: true → false
// Para verificar UI de permisos denegados
```

**4. Testing de Data Vacía vs Llena**
```
// Cambiar:
items: [...5 items] → []
// Para ver empty states sin limpiar la BD
```

#### Limitaciones de la Edición en Vivo

- **No funciona con computed values**: Valores derivados se recalcularán
- **No persiste entre renders**: Un re-render restaurará el state original
- **No dispara efectos**: Cambiar state no ejecuta `useEffect` asociados
- **Objetos inmutables**: Debes editar el valor completo, no mutarlo

---

### 1.3 Hooks Inspector - Debuggear Cada Hook

El **Hooks Inspector** muestra todos los hooks en el orden en que se llaman.

#### Visualización de Hooks

```
🪝 hooks
├─ State(1): false          // useState isLoading
├─ State(2): null           // useState data
├─ State(3): undefined      // useState error
├─ Effect(4)                // useEffect - data fetching
├─ Memo(5): {...}           // useMemo - computed value
├─ Callback(6): ƒ()         // useCallback - handler
├─ Ref(7): {current: null}  // useRef - DOM reference
└─ Context(8): {...}        // useContext - theme
```

#### Debugging de Hooks Específicos

**useState**
```
State(1): currentValue
  ↓ doble clic para editar
State(1): newValue
```

**useEffect**
```
Effect(2)
  ├─ Dependencies: [userId, isActive]
  ├─ Last run: 2.3s ago
  └─ Status: ✅ Clean (si tiene cleanup)
```

**useMemo**
```
Memo(3): computed result
  ├─ Dependencies: [data, filter]
  ├─ Value: {...}
  └─ Last recomputed: on last render
```

**useCallback**
```
Callback(4): ƒ handleClick()
  ├─ Dependencies: [count, user]
  └─ Function stable: No (se recrea cada render)
```

**useRef**
```
Ref(5): {current: <button>}
  └─ Current: HTMLButtonElement
```

**useContext**
```
Context(6): ThemeContext
  ├─ Provider: <ThemeProvider>
  └─ Value: {theme: "dark", toggleTheme: ƒ}
```

#### Identificar Problemas con Hooks

**Problema: Demasiados Re-renders**
```
🔴 State(1): count (cambia frecuentemente)
    ↓ causa
🔴 Effect(2) [count] (se ejecuta cada vez)
    ↓ causa
🔴 State(3): data (se actualiza por el effect)
    ↓ causa LOOP
```

**Problema: Dependencies Incorrectas**
```
⚠️ Effect(1)
   Dependencies: [] 
   Problem: Usa 'user' pero no está en dependencies
```

**Problema: Memo/Callback Inefectivos**
```
❌ Callback(2): ƒ handleSave()
   Dependencies: [data, config, user, settings]
   Problem: Se recrea en cada render (demasiadas deps)
```

---

### 1.4 Source Code Navigation

React DevTools permite navegar directamente al código fuente del componente.

#### Configuración

**Requisitos**:
1. Source maps habilitados en tu build
2. DevTools instalado como extensión de navegador
3. Código fuente disponible (desarrollo local)

**Configurar en Vite**:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // ← Habilitar source maps
  },
});
```

**Configurar en Webpack**:
```javascript
// webpack.config.js
module.exports = {
  devtool: 'source-map', // o 'cheap-module-source-map'
};
```

#### Uso

**Navegación al Código**:
1. Click derecho en un componente
2. Selecciona "Show source code" o presiona el ícono `<>`
3. Se abre el archivo en la pestaña "Sources" del navegador

**Navegación Directa con IDE**:
- Algunos IDEs permiten configurar DevTools para abrir archivos directamente
- Requiere configuración adicional del protocolo `vscode://`

#### Ejemplo Visual

```
UserProfile Component
  ├─ [Click derecho]
  │   └─ Show source code
  │       ↓
  │   Sources Tab
  │       └─ src/components/UserProfile.tsx:42
  │           export function UserProfile({ user }) {
  │             const [isEditing, setIsEditing] = useState(false);
  │             ...
```

---

### 1.5 Rendered By Tracking y Owners Tree

Estas características ayudan a entender **qué causó que un componente se renderice**.

#### Rendered By (Parent Hierarchy)

Muestra el árbol de componentes padres que renderizaron este componente.

```
📍 Current Component: Button

Rendered by:
  └─ UserCard
      └─ UserList
          └─ Dashboard
              └─ App
```

**Uso**:
- Identificar de dónde vienen las props
- Rastrear la jerarquía de componentes
- Debugging de prop drilling

#### Owners Tree

El **Owner** es el componente que creó este elemento (no necesariamente el padre directo).

```typescript
// Parent !== Owner example

function Dashboard() {
  // Dashboard es el OWNER de Button
  const button = <Button onClick={handleClick} />;
  
  return (
    <Card>
      {/* Card es el PARENT de Button */}
      {button}
    </Card>
  );
}
```

**Visualización en DevTools**:
```
Button
├─ Parent: Card
└─ Owner: Dashboard ← Quien lo creó
```

**Por qué importa**:
- **Props provienen del Owner**, no del Parent
- Útil para debugging cuando hay componentes intermedios
- Identifica la fuente real de datos

#### Rendered By - Causas de Re-render

DevTools puede mostrar **por qué** un componente se renderizó:

```
🔄 Button re-rendered because:
  ├─ Props changed: onClick
  │   Previous: ƒ handleClick()
  │   Current: ƒ handleClick()    ← Función diferente
  │
  └─ Parent re-rendered: UserCard
      └─ State changed: isExpanded (false → true)
```

**Interpretación**:
- `Props changed`: Muestra qué prop cambió y el diff
- `Parent re-rendered`: El padre se renderizó
- `State changed`: State interno cambió
- `Context changed`: Un context que consume cambió
- `Hooks changed`: Un hook retornó un valor diferente

---

### 1.6 Filtrado de Componentes

El filtrado permite enfocarse en componentes específicos en aplicaciones grandes.

#### Tipos de Filtros

**1. Filter by Name**
```
🔍 Search: "User"
    ↓ Muestra solo:
    - UserProfile
    - UserCard
    - UserList
    - CurrentUserWidget
```

**2. Filter by Type**
- **Host components**: Filtra componentes DOM (`div`, `button`, etc.)
- **Custom components**: Solo tus componentes
- **Memo components**: Componentes wrapped en `React.memo`
- **Forward ref components**: Componentes con `forwardRef`

**3. Filter by Location**
```
🔍 Filter by file: "components/user/"
    ↓ Muestra solo componentes de esa carpeta
```

**4. Hide Components**

Configurar componentes para ocultar automáticamente:

```typescript
// En React DevTools Settings → Components

Hide components by name:
  - HOC*           (oculta HOCs)
  - styled.*       (oculta styled-components)
  - *.Provider     (oculta Providers)
```

#### Configuración Avanzada de Filtros

**Regex Filters**:
```
Pattern: ^Modal.*
  → Muestra solo componentes que empiecen con "Modal"

Pattern: .*Form$
  → Muestra solo componentes que terminen con "Form"
```

**Component Filters en Código**:

```typescript
// Ocultar un componente específico de DevTools
MyComponent.displayName = '__MY_PRIVATE_COMPONENT__';

// React DevTools puede configurarse para ocultar componentes
// que empiecen con "__"
```

#### Casos de Uso de Filtrado

**Debugging de Performance**:
1. Oculta todos los componentes excepto los sospechosos
2. Observa solo los que importan
3. Reduce el ruido visual

**Navegación Rápida**:
```
App (5000 components)
  ↓ Filter: "Dashboard"
DashboardPage (20 components)
  ↓ Mucho más fácil de navegar
```

**Inspección de Third-Party Components**:
```
Filter: node_modules/react-query
  → Ver solo componentes de react-query
  → Útil para debugging de librerías
```

---

## 2. Profiler Tab

El **Profiler Tab** es la herramienta más poderosa para identificar problemas de performance.

### 2.1 Introducción al Profiler

#### Qué Mide el Profiler

El Profiler registra:
- **Render duration**: Cuánto tiempo tomó renderizar cada componente
- **Commit phase**: Cuándo React aplicó cambios al DOM
- **Number of renders**: Cuántas veces se renderizó cada componente
- **Why it rendered**: Razón del re-render (props, state, parent, etc.)

#### Cómo Iniciar una Sesión de Profiling

**Pasos**:
1. Abre React DevTools
2. Navega al tab **Profiler**
3. Presiona el botón **Record** (círculo rojo) ⏺
4. Interactúa con tu aplicación
5. Presiona **Stop** (cuadrado azul) ⏹
6. Analiza los resultados

**Visualización**:
```
[⏺ Record]  [⏹ Stop]  [🗑 Clear]  [⚙️ Settings]
     ↓
  Recording...
     ↓
  Interactúa con la app (clicks, typing, navigation)
     ↓
  [⏹ Stop]
     ↓
  📊 Resultados de Profiling
```

---

### 2.2 Cómo Leer Flame Charts

El **Flame Chart** es una visualización de todos los componentes que se renderizaron.

#### Anatomía del Flame Chart

```
📊 Flame Chart (Horizontal Time View)

[App ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45.2ms]
  ├─[Header ━━━━━━━━ 2.1ms]
  │   └─[Logo ━ 0.8ms]
  │   └─[Navigation ━━━━ 1.2ms]
  │
  └─[Dashboard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 42.8ms]
      ├─[Sidebar ━━━ 3.5ms]
      │   └─[MenuItem ━ 0.5ms] (x6)
      │
      └─[Content ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 38.9ms]
          ├─[UserList ━━━━━━━━━━━━━━━━━━━━━━ 35.2ms] ← SLOW!
          │   └─[UserCard ━━ 0.8ms] (x50 items)
          │
          └─[Pagination ━━ 2.1ms]
```

#### Interpretación de Colores

Los colores indican la velocidad del render:

```
🟢 Verde   (0-5ms)   : Rápido, sin problemas
🟡 Amarillo (5-10ms)  : Aceptable, monitorear
🟠 Naranja (10-20ms) : Lento, optimizar
🔴 Rojo    (20ms+)   : Muy lento, CRÍTICO
⚫ Gris              : No se renderizó en este commit
```

#### Lectura del Flame Chart

**Ancho de la barra** = Duración del render
- Barras más anchas = renders más lentos
- Barras delgadas = renders rápidos

**Posición vertical** = Jerarquía de componentes
- Arriba = Componentes padre
- Abajo = Componentes hijo
- Anidación = Estructura del árbol

**Ejemplo de Análisis**:

```
❌ Problema Identificado:

[Dashboard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 98.5ms] ← CRÍTICO
  └─[DataTable ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 96.2ms] ← BOTTLENECK
      └─[TableRow ━━ 1.8ms] (x50)

Diagnóstico:
- Dashboard toma 98.5ms (demasiado)
- DataTable es el cuello de botella (96.2ms de 98.5ms)
- Cada TableRow toma 1.8ms, pero hay 50 = 90ms total
- Solución: Virtualizar la tabla (react-window/react-virtual)
```

---

### 2.3 Cómo Leer Ranked Charts

El **Ranked Chart** ordena los componentes por duración de render.

#### Visualización del Ranked Chart

```
📊 Ranked Chart (Sorted by Duration)

1. DataTable           96.2ms ████████████████████ 🔴
2. Dashboard           45.2ms ██████████ 🟠
3. UserList            35.2ms ████████ 🟠
4. Content             12.8ms ███ 🟡
5. Sidebar              3.5ms █ 🟢
6. Pagination           2.1ms █ 🟢
7. Header               2.1ms █ 🟢
8. Navigation           1.2ms █ 🟢
9. Logo                 0.8ms █ 🟢
10. MenuItem (x6)       0.5ms █ 🟢
```

#### Interpretación

**Top componentes = Mayor impacto**:
- Los primeros componentes son los más lentos
- Enfócate en optimizar el top 3-5
- El resto probablemente está bien

**Múltiples instancias**:
```
TableRow (x50)  1.8ms cada uno
  → Total: 90ms
  → Alto impacto acumulativo
```

**Comparación de Commits**:
```
Commit #1:
1. DataTable  96.2ms 🔴

Commit #2 (después de optimización):
1. DataTable  12.5ms 🟡  ← ✅ Mejorado 87%
```

---

### 2.4 Análisis de Renders y Commit Tracking

#### ¿Qué es un Commit?

Un **commit** es cuando React aplicó cambios al DOM.

```
User Interaction
  ↓
State Change
  ↓
React Render Phase (virtual DOM)
  ↓
React Commit Phase (real DOM) ← Profiler registra esto
  ↓
Browser Paint
```

#### Timeline de Commits

```
📊 Profiler Timeline

[Commit 1] ━━━ 15.2ms   (Initial mount)
     ↓ 100ms
[Commit 2] ━ 3.1ms      (Button click)
     ↓ 250ms
[Commit 3] ━━━━━ 45.8ms (Data load) ← SLOW
     ↓ 50ms
[Commit 4] ━ 2.5ms      (Dropdown open)
     ↓ 1000ms
[Commit 5] ━ 1.8ms      (Mouse hover)
```

#### Navegar Entre Commits

**Controles**:
- `◀` Commit anterior
- `▶` Commit siguiente
- Click en la timeline para saltar a un commit específico

**Información de cada Commit**:
```
Commit #3 - 45.8ms
├─ Trigger: State change in DataTable
├─ Components rendered: 78
├─ Total time: 45.8ms
├─ Render phase: 42.3ms
└─ Commit phase: 3.5ms
```

---

### 2.5 Identificación de Componentes Lentos

#### Estrategias de Identificación

**1. Top-Down Approach**
```
Empezar desde el componente raíz más lento
  ↓
Identificar el hijo más lento
  ↓
Repetir hasta encontrar el cuello de botella
```

**Ejemplo**:
```
App (100ms)
  → Dashboard (95ms) ← Investigar
      → DataTable (90ms) ← Real culprit
          → TableRow (1.5ms x 60 = 90ms) ← FIX THIS
```

**2. Ranked Chart Approach**
```
Ordenar por duración
  ↓
Revisar top 5 componentes
  ↓
Analizar por qué son lentos
```

**3. Diff Between Commits**
```
Commit #1: 5ms
Commit #2: 95ms ← ¿Qué cambió?
  → Analizar diff
  → Identificar qué trigger causó el problema
```

#### Señales de Componentes Problemáticos

**🔴 Señal 1: Render Time Alto**
```
Component: DataGrid
Render time: 150ms ← Mayor a 16ms (60fps)
Problema: Bloqueante
```

**🔴 Señal 2: Renders Frecuentes**
```
Component: Timer
Renders in session: 342
Problema: Se renderiza cada 100ms
Solución: Memoizar o reducir frecuencia
```

**🔴 Señal 3: Renders en Cascada**
```
Parent renders
  → Child 1 renders
    → Child 2 renders
      → Child 3 renders
        → Todos innecesarios
```

**🔴 Señal 4: Componentes Idle que Re-renderizan**
```
SidebarMenu (no visible)
  → Re-renders: 15 veces
  → Problema: Escucha context que no usa
```

#### Drill-Down en Componentes Lentos

**Paso 1: Click en el componente**
```
[DataTable ━━━━━━━━━━━━━━━━━ 90ms]
  ↓ Click
Detalles:
  ├─ Render duration: 90ms
  ├─ Why: Props changed (data)
  ├─ Props changes:
  │   - data: [50 items] → [50 items] ← Nueva referencia
  └─ Rendered 50 children
```

**Paso 2: Analizar "Why"**
```
Why did this render?
  ✓ Parent component rendered
  ✓ Props changed: data, onSort
  ✗ State changed
  ✗ Context changed
```

**Paso 3: Comparar Props**
```
Previous props:
  data: Array(50) [...]
  onSort: ƒ handleSort()

Current props:
  data: Array(50) [...] ← Nueva referencia de array
  onSort: ƒ handleSort() ← Nueva función
```

**Paso 4: Identificar Fix**
```
Problema: data y onSort son nuevas referencias
Fix:
  1. Memoizar data: const data = useMemo(...)
  2. Memoizar onSort: const onSort = useCallback(...)
  3. Wrap component: React.memo(DataTable)
```

---

### 2.6 Filtrado por Duración

El filtrado por duración permite enfocarse en componentes lentos.

#### Configuración de Threshold

```
⚙️ Settings → Profiler
  
Flamegraph threshold: 0ms ━━━━━━━━━━━━━━●━ 100ms
                           ↑
                         5ms (current)
```

**Efecto**:
```
Threshold: 0ms  → Muestra todos los componentes
Threshold: 5ms  → Oculta componentes < 5ms
Threshold: 10ms → Solo muestra componentes lentos
```

#### Visualización con Threshold

**Threshold: 0ms (default)**
```
[App ━━━━━━━━━━━━━━━━━━━ 50ms]
  ├─[Header ━━ 2ms]
  │   └─[Logo ━ 0.5ms]
  │   └─[Nav ━ 1ms]
  └─[Content ━━━━━━━━━━━ 47ms]
      └─[List ━━━━━━━━━ 45ms]
          └─[Item ━ 0.8ms] (x50)
```

**Threshold: 5ms (filtered)**
```
[App ━━━━━━━━━━━━━━━━━━━ 50ms]
  └─[Content ━━━━━━━━━━━ 47ms]
      └─[List ━━━━━━━━━ 45ms]
          
⚫ Componentes < 5ms ocultos
```

**Threshold: 40ms (only critical)**
```
[App ━━━━━━━━━━━━━━━━━━━ 50ms]
  └─[Content ━━━━━━━━━━━ 47ms]
      └─[List ━━━━━━━━━ 45ms] ← Solo este es visible
```

#### Casos de Uso

**Debugging Inicial**:
```
Threshold: 0ms
  → Ver todo el árbol
  → Entender la estructura
```

**Identificación de Bottlenecks**:
```
Threshold: 16ms (60fps threshold)
  → Ver solo componentes que bloquean frames
  → Priorizar optimizaciones
```

**Fine-Tuning**:
```
Threshold: 5-10ms
  → Balance entre detalle y claridad
  → Ignorar ruido de componentes rápidos
```

---

### 2.7 Interpretación de Resultados

#### Métricas Clave

**1. Commit Duration**
```
Total commit duration: 45.2ms

Interpretación:
  < 16ms   ✅ Excelente (60fps)
  16-33ms  ⚠️  Aceptable (30fps)
  33-50ms  🔴 Lento (20fps)
  > 50ms   🔴 Muy lento (< 20fps, bloqueante)
```

**2. Render Phase vs Commit Phase**
```
Commit #3:
├─ Render phase: 42ms (Virtual DOM diff)
└─ Commit phase: 3ms  (Real DOM updates)

Interpretación:
- Render phase alto → Componentes lentos, cálculos pesados
- Commit phase alto → Demasiados DOM updates
```

**3. Component Render Count**
```
Component: TableRow
Renders in this session: 150

Interpretación:
- 150 renders en 10s = 15 renders/s
- Probablemente demasiado frecuente
- Investigar por qué se renderiza tanto
```

**4. Self Time vs Total Time**
```
DataTable:
├─ Self time: 5ms    (tiempo propio del componente)
└─ Total time: 90ms  (incluyendo children)

Interpretación:
- Self time bajo = El componente en sí es rápido
- Total time alto = Los children son el problema
- Optimizar children, no el componente mismo
```

#### Patrones de Performance

**✅ Patrón Saludable**
```
Características:
- Commits < 16ms
- Pocos re-renders innecesarios
- Self time distribuido equitativamente
- No hay componentes dominantes

Example:
Commit #1: 8ms
  ├─ Header: 1ms
  ├─ Content: 5ms
  └─ Footer: 1ms
```

**⚠️ Patrón de Cascada**
```
Problema: Renders en cascada

Parent (2ms)
  → Child 1 re-renders (3ms)
    → Child 2 re-renders (4ms)
      → Child 3 re-renders (5ms)

Total: 14ms (podría ser 2ms con memo)
```

**🔴 Patrón de Bottleneck**
```
Problema: Un componente domina el render time

App (100ms)
  ├─ Header: 1ms
  └─ DataGrid: 98ms ← BOTTLENECK
      └─ ...

Fix: Optimizar DataGrid (virtualización, memo, etc.)
```

**🔴 Patrón de Polling**
```
Problema: Renders frecuentes innecesarios

Timeline:
[Commit] ━ 5ms
    ↓ 100ms
[Commit] ━ 5ms
    ↓ 100ms
[Commit] ━ 5ms
    ↓ 100ms (10 commits/s)

Fix: Reducir frecuencia, debounce, o optimizar
```

---

## 3. Settings y Configuraciones Avanzadas

### 3.1 Highlight Updates

Esta característica **resalta visualmente** los componentes que se están renderizando.

#### Activar Highlight Updates

**Pasos**:
1. Abre React DevTools
2. Click en el ícono de ⚙️ Settings
3. Activa **"Highlight updates when components render"**

**Visualización**:
```
Componente que se renderiza → Borde azul/verde
Componente que NO se renderiza → Sin borde
```

#### Interpretación de Colores

```
🟦 Azul   → Render poco frecuente (bueno)
🟩 Verde  → Render ocasional (normal)
🟨 Amarillo → Render frecuente (monitorear)
🟧 Naranja → Render muy frecuente (problema)
🟥 Rojo   → Render constante (crítico)
```

#### Casos de Uso

**1. Identificar Re-renders Innecesarios**
```
Acción: Click en un botón
Esperado: Solo Button se resalta
Actual: Todo el árbol se resalta 🟥

Problema: El onClick crea una nueva función cada render
Fix: useCallback
```

**2. Debugging de Context Performance**
```
Acción: Cambiar theme en Context
Esperado: Solo componentes que usan theme se resaltan
Actual: Toda la app se resalta 🟥

Problema: Context no está dividido correctamente
Fix: Separar state de actions en contexts diferentes
```

**3. Verificar Optimizaciones**
```
Antes de React.memo:
  → Componente se resalta en cada parent render 🟧

Después de React.memo:
  → Componente NO se resalta si props no cambian ✅
```

#### Configuración Avanzada

**Customizar Intensity**:
```
Settings → General
  Highlight updates intensity: ━━━━●━━━━━━ 
                                    ↑
                                  Medium
```

**Hide in Production**:
```
Esta feature solo funciona en development mode
En production build, está automáticamente deshabilitada
```

---

### 3.2 Component Filters Personalizados

Los filtros permiten ocultar componentes del DevTools tree.

#### Tipos de Filtros

**1. Hide by Name Pattern**
```
Settings → Components → Filters

Add filter:
  Pattern: ^styled.*
  Type: Hide matching components
  
Efecto: Oculta todos los componentes styled-components
```

**2. Hide by Location**
```
Pattern: node_modules/
Type: Hide matching paths

Efecto: Oculta todos los componentes de librerías externas
```

**3. Hide by Type**
```
☑ Hide host components (DOM elements)
☑ Hide components without displayName
☐ Show only selected components
```

#### Configuraciones Comunes

**Ocultar HOCs**:
```
Pattern: ^(withRouter|withAuth|connect).*
Type: Hide matching
```

**Ocultar Wrappers**:
```
Patterns:
  - ^_.*          (componentes internos)
  - .*\.Provider  (providers)
  - .*\.Consumer  (consumers)
```

**Mostrar Solo Componentes de Negocio**:
```
Pattern: ^(src/components/).*
Type: Show only matching
```

#### Ejemplo Visual

**Sin Filtros**:
```
App
  └─ ThemeProvider
      └─ AuthProvider
          └─ Router
              └─ styled.div
                  └─ Dashboard ← Lo que me interesa
                      └─ styled.section
                          └─ UserList
```

**Con Filtros** (hide providers & styled):
```
App
  └─ Dashboard ← Más fácil de navegar
      └─ UserList
```

---

### 3.3 Debugging Mode

El modo de debugging agrega información adicional y herramientas.

#### Activar Debugging Mode

```
Settings → General
  ☑ Enable advanced profiling
  ☑ Record why each component rendered
  ☑ Hide logs during second render in Strict Mode
```

#### Features del Debugging Mode

**1. Render Cause Tracking**
```
Component: UserCard

Why rendered:
  ✓ Props changed: user.name
  ✗ State changed
  ✗ Context changed
  ✗ Parent forced update
  
Props diff:
  - user.name: "John" → "Jane"
  - user.id: "123" (unchanged)
```

**2. Advanced Profiling**
```
Profiling data incluye:
  ├─ Component tree with owners
  ├─ Interaction tracking
  ├─ Suspense boundaries
  └─ Concurrent features (transitions, etc.)
```

**3. Strict Mode Filtering**
```
Strict Mode renderiza 2 veces en dev
Con esta opción:
  → Solo muestra el segundo render
  → Reduce ruido en console.log
```

#### Performance Overhead

**Costo del Debugging Mode**:
```
Normal mode:     ~2% overhead
Debugging mode:  ~10-15% overhead

Recomendación:
  ✓ Activar solo cuando debuggees
  ✗ No dejar activado permanentemente
```

---

### 3.4 Otras Configuraciones Útiles

**General Settings**:
```
☑ Append component stack to console warnings
☑ Show inline warnings and errors
☑ Enable clipboard paste
☐ Break on warnings
```

**Components Tab**:
```
☑ Show hooks in devtools
☑ Collapse component tree by default
☐ Hide components without displayName
```

**Profiler Tab**:
```
☑ Record why each component rendered
☑ Hide commits below threshold (5ms)
☐ Record timeline
```

**Theme**:
```
Theme: ⚫ Auto ⚪ Light 🌙 Dark
```

---

## 4. Problemas Comunes y Soluciones

### 4.1 Profiler que No Graba

#### Síntoma
El botón de Record no funciona, o no muestra datos después de grabar.

#### Causas y Soluciones

**1. React DevTools Desactualizado**
```
Problema: Versión vieja de DevTools
Solución:
  1. Ve a chrome://extensions
  2. Encuentra React Developer Tools
  3. Click en "Update" o reinstala
```

**2. React Version Incompatible**
```
Problema: React < 16.9 no tiene profiling completo
Solución:
  - Actualizar React a >= 16.9
  - Para profiling completo, usar React >= 18
```

**3. Production Build**
```
Problema: Profiler está limitado en production
Solución: Usar development build o profiling build

// vite.config.ts
export default defineConfig({
  mode: 'development', // ← Cambiar aquí
});
```

**4. Build Profiling Específico**
```
Para profiling en production-like:

// package.json
"scripts": {
  "build:profiling": "react-scripts build --profile"
}

// Luego en tu app:
import { createRoot } from 'react-dom/client';
// En vez de 'react-dom/client', usar:
import { createRoot } from 'react-dom/profiling';
```

**5. Extension Conflictos**
```
Problema: Otra extensión interfiere
Solución:
  1. Desactiva otras extensions
  2. Prueba en modo incognito
  3. Limpia cache y recarga
```

---

### 4.2 Información Incompleta

#### Síntoma
El Profiler muestra datos parciales o componentes sin nombre.

#### Causas y Soluciones

**1. Componentes Anónimos**
```
❌ Problema:
export default () => <div>Hello</div>;
// DevTools muestra: <Anonymous>

✅ Solución:
export default function MyComponent() {
  return <div>Hello</div>;
}
// O agregar displayName
MyComponent.displayName = 'MyComponent';
```

**2. Minified Components**
```
Problema: En production, nombres minificados
Componente real: UserDashboard
DevTools muestra: <a>

Solución: Usar profiling build (preserva nombres)
```

**3. Source Maps Faltantes**
```
Problema: No puede mapear a código fuente
Solución:

// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // ← Agregar
  },
});
```

**4. Components sin Renderizar**
```
Problema: Componentes lazy-loaded no aparecen
Solución:
  - Interactúa con la app para cargar componentes
  - Navega a todas las rutas durante la sesión
```

**5. Profiling Data Corrupto**
```
Síntoma: "No profiling data" aunque grabaste
Solución:
  1. Clear DevTools cache
  2. Reload la página
  3. Graba de nuevo
  4. No minimices DevTools durante grabación
```

---

### 4.3 Performance Overhead del Profiler

#### Síntoma
La app se vuelve lenta cuando el Profiler está grabando.

#### Entender el Overhead

```
Sin Profiler:        100ms (baseline)
Con Profiler:        115ms (+15% overhead)
Con Profiler + Debug: 130ms (+30% overhead)
```

**Esto es normal**: El Profiler agrega instrumentación.

#### Minimizar el Overhead

**1. Graba Solo Interactions Cortas**
```
❌ Malo:
  Start recording → Usar app 5 minutos → Stop
  (Demasiados datos, posible crash)

✅ Bueno:
  Start → Interaction específica (2-5s) → Stop
  (Datos manejables, análisis enfocado)
```

**2. Usa Threshold de Filtrado**
```
Settings → Profiler
  Flamegraph threshold: 5ms
  
Reduce overhead al filtrar componentes rápidos
```

**3. Deshabilita "Record Why"**
```
Settings → Profiler
  ☐ Record why each component rendered
  
Esto reduce overhead ~5-10%
```

**4. Cierra Otros Tabs**
```
El profiler consume memoria
Si tienes 50 tabs abiertas → Más lento
Solución: Cierra tabs innecesarias
```

**5. Usa Profiling Build**
```
Development build: +30% overhead
Profiling build: +10% overhead ← Mejor

npm run build:profiling
```

#### Cuándo el Overhead es un Problema

```
Si tu app es lenta SOLO con Profiler:
  → El overhead es aceptable
  → Los números siguen siendo útiles relativamente

Si tu app es lenta SIN Profiler:
  → Problema real de performance
  → Profiler te ayudará a encontrarlo
```

---

### 4.4 Componentes que Aparecen como <Anonymous>

#### Causa
Componentes sin nombre o arrow functions sin displayName.

#### Soluciones

**1. Usa Declaraciones de Función**
```typescript
❌ Malo:
export default () => <div>Hello</div>;

✅ Bueno:
export default function MyComponent() {
  return <div>Hello</div>;
}
```

**2. Agrega displayName Manualmente**
```typescript
const MyComponent = () => <div>Hello</div>;
MyComponent.displayName = 'MyComponent';
export default MyComponent;
```

**3. Usa Named Exports**
```typescript
❌ Confuso:
export default function() { ... }

✅ Claro:
export function UserDashboard() { ... }
```

**4. Para HOCs**
```typescript
function withAuth(Component) {
  const WrappedComponent = (props) => {
    // auth logic
    return <Component {...props} />;
  };
  
  // ✅ Importante: Agregar displayName
  WrappedComponent.displayName = 
    `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
}
```

**5. Babel Plugin (Automático)**
```javascript
// .babelrc
{
  "plugins": [
    ["babel-plugin-react-displayname"]
  ]
}

// Agrega displayName automáticamente
```

---

### 4.5 DevTools No Detecta React

#### Síntoma
La tab de React no aparece en DevTools.

#### Diagnóstico

**1. Verificar que React Esté Cargado**
```javascript
// En console del navegador:
console.log(window.React);

Si es undefined → React no está cargado
```

**2. Verificar Hook de DevTools**
```javascript
console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);

Si es undefined → DevTools no se inicializó
```

#### Soluciones

**1. React No Está en la Página**
```
Verifica que realmente uses React
Mira el source de la página
Busca react.js o react-dom.js
```

**2. Versión de React Muy Vieja**
```
React < 16: DevTools limitado
Solución: Actualizar React
```

**3. iFrame Issues**
```
Si tu app está en un iframe:
  → DevTools puede no detectarla
  → Usa standalone DevTools en su lugar
```

**4. Extension No Instalada**
```
Instala React DevTools:
  Chrome: https://chrome.google.com/webstore/...
  Firefox: https://addons.mozilla.org/...
  Edge: https://microsoftedge.microsoft.com/addons/...
```

**5. CSP (Content Security Policy) Bloqueando**
```
Si tienes CSP headers estrictos:
  → Pueden bloquear DevTools

Solución: Permite extensión en CSP
  script-src 'self' 'unsafe-inline' chrome-extension:;
```

---

### 4.6 Profiler Muestra Solo un Commit

#### Síntoma
Grabas varios interactions pero solo aparece 1 commit.

#### Causas

**1. Batching Automático (React 18+)**
```
React 18 hace automatic batching:
  
setState1();
setState2();
setState3();
  ↓
1 solo commit (no 3)

Esto es correcto y esperado
```

**2. Interactions Muy Rápidas**
```
Si las interacciones son < 1ms:
  → Pueden agruparse en 1 commit
  → Esto es bueno (significa que es rápido)
```

**3. Componentes Memoizados**
```
Si todo está en React.memo:
  → Pocos componentes se renderizan
  → Solo 1 commit visible

Esto es bueno, no un problema
```

#### Soluciones (si realmente necesitas ver más)

**1. Opt-out de Batching (React 18)**
```typescript
import { flushSync } from 'react-dom';

// Forzar commit inmediato
flushSync(() => {
  setState1(value1);
});

flushSync(() => {
  setState2(value2); // ← Otro commit
});
```

**2. Graba Interactions Más Lentas**
```
En vez de:
  Click rápido → 1 commit

Prueba:
  Data fetching → Múltiples commits (loading, success)
```

---

## 5. Recursos y Referencias

### 5.1 Documentación Oficial

**React DevTools**
- [Documentación oficial](https://react.dev/learn/react-developer-tools)
- [GitHub Repository](https://github.com/facebook/react/tree/main/packages/react-devtools)
- [Blog: Introducing the React Profiler](https://legacy.reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- [Blog: New React DevTools](https://legacy.reactjs.org/blog/2019/08/15/new-react-devtools.html)

**Profiler API**
- [Profiler API Reference](https://react.dev/reference/react/Profiler)
- [React Performance Tracks](https://react.dev/reference/dev-tools/react-performance-tracks)

### 5.2 Videos y Tutoriales

**Oficiales**
- [React Conf 2021 - DevTools Deep Dive](https://www.youtube.com/watch?v=placeholder)
- [Brian Vaughn - React Profiler](https://www.youtube.com/watch?v=placeholder)

**Comunidad**
- Kent C. Dodds: "Optimize React Performance"
- Jack Herrington: "React Performance Profiling"
- Web Dev Simplified: "React DevTools Tutorial"

### 5.3 Blogs y Artículos

- [React DevTools Profiler: Measuring Performance](https://blog.logrocket.com/react-devtools-profiler/)
- [Profiling React Apps with the DevTools Profiler](https://kentcdodds.com/blog/profile-a-react-app-for-performance)
- [React Performance Optimization Guide](https://www.patterns.dev/posts/react-performance)

### 5.4 Herramientas Complementarias

**Chrome DevTools Performance Tab**
- Profiling más allá de React
- Análisis de JavaScript execution
- Main thread blocking

**React Performance Monitoring**
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Chrome UX Report](https://developers.google.com/web/tools/chrome-user-experience-report)

**Third-Party Profilers**
- [Why Did You Render](https://github.com/welldone-software/why-did-you-render)
- [React Scan](https://github.com/aidenybai/react-scan)

### 5.5 Cheat Sheet Rápido

```
🎯 PROFILING WORKFLOW

1. Identificar el problema
   → Lento inicial load? Interacción específica?
   
2. Record interaction
   → Profiler tab → Record → Interact → Stop
   
3. Analizar Flame Chart
   → Buscar barras rojas/naranjas
   → Identificar componente más ancho
   
4. Analizar Ranked Chart
   → Ver top 5 componentes
   → Priorizar optimizaciones
   
5. Investigar componente lento
   → Click → Ver "why it rendered"
   → Analizar props/state changes
   
6. Aplicar optimización
   → React.memo, useMemo, useCallback
   → Virtualización, lazy loading
   
7. Re-profile y comparar
   → Grabar de nuevo
   → Comparar durations
   → Validar mejora

🎯 DEVTOOLS SHORTCUTS

Components Tab:
  - Ctrl+F: Buscar componente
  - Click derecho → Source: Ver código
  - Doble click: Editar state/props
  
Profiler Tab:
  - Record: ⏺
  - Stop: ⏹
  - Clear: 🗑
  - ◀▶: Navegar commits
  
General:
  - F12: Abrir DevTools
  - Ctrl+Shift+C: Inspect element mode
```

---

## Conclusión

React DevTools y el Profiler son herramientas esenciales para:
- 🔍 **Debuggear** problemas de state y props
- ⚡ **Optimizar** performance de aplicaciones React
- 🧪 **Testing** de diferentes estados sin escribir código
- 📊 **Medir** y validar mejoras de performance

**Próximos Pasos**:
- Practica profiling en tu aplicación actual
- Identifica y optimiza los top 3 componentes lentos
- Configura filters para reducir ruido visual
- Usa Highlight Updates para identificar re-renders innecesarios

---

**Actualizado**: 25 Diciembre 2025  
**Versión**: 1.0  
**Autor**: Performance Optimization Team
