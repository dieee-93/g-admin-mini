# 12. DEBUGGING DE BUILD Y BUNDLING ISSUES

## Tabla de Contenidos
- [1. Build Errors](#1-build-errors)
- [2. Bundle Optimization Debugging](#2-bundle-optimization-debugging)
- [3. Environment Variables](#3-environment-variables)
- [4. Deployment Issues](#4-deployment-issues)
- [5. Advanced Debugging Techniques](#5-advanced-debugging-techniques)
- [6. Performance Profiling](#6-performance-profiling)

---

## 1. Build Errors

### 1.1 Vite Build Errors Comunes

#### Error: Cannot find module

**Stack Trace Típico:**
```bash
[vite]: Rollup failed to resolve import "@/components/MyComponent" from "src/App.tsx"
error during build:
Error: Could not resolve "@/components/MyComponent" from "src/App.tsx"
    at error (file:///node_modules/rollup/dist/es/shared/parseAst.js:337:30)
    at ModuleLoader.handleInvalidResolvedId (file:///node_modules/rollup/dist/es/shared/node-entry.js:18353:24)
```

**Causas Comunes:**
1. Path aliases no configurados correctamente
2. Extensiones de archivo faltantes
3. Case sensitivity en Linux vs Windows/macOS

**Solución Paso a Paso:**

```typescript
// 1. Verificar tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]  // ✅ Debe coincidir con vite.config.ts
    }
  }
}

// 2. Verificar vite.config.ts
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths(), // ✅ Plugin necesario para resolver paths
  ],
  resolve: {
    alias: {
      '@': '/src',  // ✅ Alternativa sin plugin
    },
  },
})

// 3. Verificar case sensitivity
// ❌ Incorrecto (diferentes casos)
import MyComponent from '@/components/myComponent'  // archivo: MyComponent.tsx

// ✅ Correcto (mismo caso)
import MyComponent from '@/components/MyComponent'  // archivo: MyComponent.tsx
```

**Script de Diagnóstico:**
```bash
# Verificar que todos los imports usen el case correcto
npm run build 2>&1 | grep -i "could not resolve"

# En Windows PowerShell:
npm run build 2>&1 | Select-String "could not resolve"
```

---

#### Error: Failed to parse source for import analysis

**Stack Trace Típico:**
```bash
[vite] Internal server error: Failed to parse source for import analysis because the content contains invalid JS syntax.
Plugin: vite:import-analysis
File: /src/components/BrokenComponent.tsx
  Unexpected token (15:5)
  13 |   const handleClick = () => {
  14 |     console.log('clicked')
> 15 |   }
     |      ^
  16 |
  17 |   return <div>{data}</div>
```

**Causas Comunes:**
1. Sintaxis JSX/TSX inválida
2. Problemas con comentarios o strings mal cerrados
3. Caracteres especiales no escapados

**Solución:**

```typescript
// ❌ Error común: return statement faltante
const MyComponent = () => {
  const data = "Hello"
  <div>{data}</div>  // ❌ Falta return
}

// ✅ Correcto
const MyComponent = () => {
  const data = "Hello"
  return <div>{data}</div>  // ✅ Con return
}

// ❌ Error: JSX no cerrado
const BrokenComponent = () => {
  return (
    <div>
      <span>Text
    </div>  // ❌ Falta cerrar </span>
  )
}

// ✅ Correcto
const FixedComponent = () => {
  return (
    <div>
      <span>Text</span>  // ✅ Tag cerrado
    </div>
  )
}
```

---

#### Error: TypeScript Compilation Errors

**Stack Trace Típico:**
```bash
vite v7.1.9 building for production...
✓ 1234 modules transformed.
[TypeScript] Found 3 errors. Watching for file changes.

src/store/userStore.ts:45:7 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.

45   const name: string = user?.name
         ~~~~

src/components/Header.tsx:12:18 - error TS2339: Property 'title' does not exist on type '{}'.

12   <h1>{props.title}</h1>
                ~~~~~~
```

**Soluciones:**

```typescript
// ❌ Problema: Nullable types
interface User {
  name?: string
}

const user: User = {}
const name: string = user.name  // ❌ Error: puede ser undefined

// ✅ Solución 1: Nullish coalescing
const name: string = user.name ?? 'Guest'

// ✅ Solución 2: Type guard
const name: string = user.name || 'Guest'

// ✅ Solución 3: Non-null assertion (usar con cuidado)
const name: string = user.name!

// ❌ Problema: Props no tipadas
const Header = (props: {}) => {
  return <h1>{props.title}</h1>  // ❌ Error
}

// ✅ Solución: Props interface
interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => {
  return <h1>{title}</h1>  // ✅ Correcto
}
```

**Configuración de tsconfig.json para mejor debugging:**

```json
{
  "compilerOptions": {
    "strict": true,              // ✅ Habilitar modo strict
    "noImplicitAny": true,       // ✅ Prevenir any implícito
    "strictNullChecks": true,    // ✅ Verificar null/undefined
    "skipLibCheck": true,        // ⚡ Acelerar build (skip libs)
    
    // Debugging helpers
    "sourceMap": true,           // ✅ Para debugging en producción
    "declarationMap": true,      // ✅ Para jump-to-definition
    "noUnusedLocals": true,      // ✅ Detectar imports sin usar
    "noUnusedParameters": true,  // ✅ Detectar params sin usar
    
    // Build performance
    "incremental": true,         // ✅ Builds incrementales
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"
  }
}
```

---

#### Error: Module format conflicts (ESM vs CJS)

**Stack Trace Típico:**
```bash
[vite] Named export 'someFunction' not found. The requested module 'some-package' is a CommonJS module
error during build:
Error: someFunction is not exported by node_modules/some-package/index.js
```

**Causas:**
- Paquete CommonJS siendo importado como ESM
- Mezcla de `require()` y `import`

**Soluciones:**

```javascript
// ❌ Problema: Default import de paquete CommonJS
import pkg from 'some-cjs-package'
console.log(pkg.someFunction())  // ❌ Error si no tiene default export

// ✅ Solución 1: Named import con namespace
import * as pkg from 'some-cjs-package'
console.log(pkg.someFunction())

// ✅ Solución 2: Configurar en vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['some-cjs-package'],  // ✅ Pre-bundle para convertir a ESM
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],    // ✅ Incluir en transformación CJS
      transformMixedEsModules: true // ✅ Permitir mezcla
    }
  }
})

// ✅ Solución 3: Dynamic import
const pkg = await import('some-cjs-package')
console.log(pkg.default.someFunction())
```

---

#### Error: Cache Issues

**Síntomas:**
- Build funciona en máquina local pero falla en CI
- Cambios no se reflejan después de rebuild
- Errores de "stale imports"

**Stack Trace Típico:**
```bash
[vite] Pre-transform error: Failed to load url /node_modules/.vite/deps/chunk-ABCD1234.js
Could not load /node_modules/.vite/deps/chunk-ABCD1234.js (imported by src/App.tsx)
```

**Soluciones:**

```bash
# 1. Limpiar cache de Vite
rm -rf node_modules/.vite

# En Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.vite

# 2. Limpiar cache de TypeScript
rm -rf node_modules/.tmp

# 3. Limpiar dist
rm -rf dist

# 4. Rebuild completo
npm run build

# 5. Script de limpieza completa (package.json)
```

```json
{
  "scripts": {
    "clean": "rm -rf node_modules/.vite node_modules/.tmp dist",
    "clean:build": "npm run clean && npm run build",
    "prebuild": "rm -rf dist"  // ✅ Auto-limpieza antes de build
  }
}
```

**Forzar regeneración de deps en vite.config.ts:**

```typescript
export default defineConfig({
  optimizeDeps: {
    force: true,  // ⚠️ Solo para debugging, remover en producción
  },
  server: {
    watch: {
      usePolling: true,  // ✅ Para Docker/WSL
    }
  }
})
```

---

### 1.2 Webpack Errors (Para referencia legacy)

Aunque este proyecto usa Vite, es útil conocer errores equivalentes:

| Webpack Error | Vite Equivalente | Solución |
|---------------|------------------|----------|
| `Module not found` | `Could not resolve` | Verificar paths y aliases |
| `Can't resolve 'webpack'` | N/A | Vite no necesita webpack |
| `Invalid configuration object` | `Invalid config` | Verificar vite.config.ts |
| `DefinePlugin` | `define` option | Usar `define` en config |

---

## 2. Bundle Optimization Debugging

### 2.1 Vite Bundle Analyzer

**Instalación y Uso:**

```bash
npm install --save-dev rollup-plugin-visualizer vite-bundle-analyzer
```

**Configuración en vite.config.ts:**

```typescript
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  plugins: [
    // Opción 1: Visualizer (genera HTML estático)
    visualizer({
      open: true,              // ✅ Abrir automáticamente
      filename: 'dist/stats.html', // ✅ Ubicación del reporte
      gzipSize: true,          // ✅ Mostrar tamaño gzip
      brotliSize: true,        // ✅ Mostrar tamaño brotli
      template: 'treemap',     // ✅ sunburst | treemap | network
    }),
    
    // Opción 2: Analyzer (servidor interactivo)
    analyzer({
      analyzerMode: 'static',  // static | server | disabled
      openAnalyzer: true,
    })
  ],
  
  build: {
    // ✅ Generar source maps para análisis
    sourcemap: true,
    
    // ✅ Warning cuando chunks exceden 500KB
    chunkSizeWarningLimit: 500,
    
    // ✅ Reportar tamaño de chunks
    reportCompressedSize: true,
  }
})
```

**Uso:**

```bash
# Build con análisis
npm run build

# Genera: dist/stats.html
# Abrir en navegador para ver treemap interactivo
```

**Ejemplo de Output:**

```bash
vite v7.1.9 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     123.45 kB │ gzip: 45.67 kB
dist/assets/vendor-react-abc.js 142.34 kB │ gzip: 52.12 kB  ⚠️ GRANDE
dist/assets/vendor-charts-def.js 89.23 kB │ gzip: 28.45 kB

(!) Some chunks are larger than 500 kB after minification
vendor-react-abc.js (142.34 kB)
```

---

### 2.2 Code Splitting Debugging

**Problema: Chunks muy grandes**

**Diagnóstico:**

```typescript
// vite.config.ts - Análisis manual de chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ✅ Logging para debugging
          if (id.includes('node_modules')) {
            console.log('📦 Dependency:', id.split('node_modules/')[1])
            
            // Detectar dependencias grandes
            if (id.includes('react')) return 'vendor-react'
            if (id.includes('chart')) return 'vendor-charts'
            if (id.includes('@supabase')) return 'vendor-supabase'
            
            // Resto en vendor genérico
            return 'vendor'
          }
        }
      }
    }
  }
})
```

**Configuración Óptima (del proyecto actual):**

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // ✅ BEST PRACTICE: Object syntax para vendor dependencies
        manualChunks: {
          // Core React - DEBE cargar primero
          'vendor-react': [
            'react', 
            'react-dom', 
            'react/jsx-runtime',
            'react/jsx-dev-runtime'
          ],
          
          // Router - separado para mejor caching
          'vendor-router': ['react-router-dom'],
          
          // Forms - usado frecuentemente juntos
          'vendor-forms': [
            'react-hook-form', 
            'zod', 
            '@hookform/resolvers'
          ],
          
          // Supabase - grande y rara vez cambia
          'vendor-supabase': [
            '@supabase/supabase-js', 
            '@supabase/ssr'
          ],
          
          // Date utilities
          'vendor-datetime': ['date-fns'],
          
          // Charts - librerías de visualización grandes
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          
          // Icons - match import paths exactos
          'vendor-icons': [
            '@heroicons/react/24/outline',
            '@heroicons/react/24/solid',
            '@heroicons/react/20/solid'
          ],
        }
      }
    }
  }
})
```

**⚠️ ANTI-PATTERN: Function-based chunks para React**

```typescript
// ❌ NUNCA hacer esto con React
manualChunks: (id) => {
  if (id.includes('react')) {
    return 'vendor-react'  // ❌ Rompe orden de carga
  }
}

// ✅ Usar object syntax
manualChunks: {
  'vendor-react': ['react', 'react-dom']  // ✅ Garantiza orden
}
```

**Error que causa:**
```bash
Uncaught TypeError: Cannot read properties of undefined (reading 'useState')
    at useState (index-abc123.js:1:23)
```

**Razón:** Function-based chunks rompen el orden de carga, causando que el código de la app intente usar React antes de que esté disponible.

---

### 2.3 Tree Shaking Problems

**Diagnóstico: ¿Por qué no se elimina código muerto?**

**Problema 1: Side effects no declarados**

```typescript
// ❌ Problema: Librería con side effects ocultos
import 'some-library/dist/styles.css'  // Side effect
import { usedFunction } from 'some-library'

// Todo el paquete se incluye porque tiene side effect
```

**Solución:**

```json
// package.json (de la librería)
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// O en vite.config.ts
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      treeShaking: true
    }
  }
})
```

**Problema 2: CommonJS modules**

```javascript
// ❌ No tree-shakeable
const _ = require('lodash')
const result = _.map(array, fn)

// ✅ Tree-shakeable (ESM)
import { map } from 'lodash-es'
const result = map(array, fn)
```

**Problema 3: Re-exports con side effects**

```typescript
// ❌ src/utils/index.ts - Re-export con side effects
export * from './math'    // Incluye TODO el archivo
export * from './strings' // Incluye TODO el archivo
export * from './init'    // Incluye side effects

// ✅ Import específico en lugar de re-export
// Usar imports directos donde se necesita:
import { add } from '@/utils/math'
import { capitalize } from '@/utils/strings'
```

**Verificar Tree Shaking:**

```typescript
// Test file: test-tree-shaking.ts
export const used = () => console.log('I am used')
export const unused = () => console.log('I should be removed')

// app.ts
import { used } from './test-tree-shaking'
used()

// Verificar en el bundle final:
// 1. Build
npm run build

// 2. Buscar "I should be removed" en dist
grep -r "I should be removed" dist/

// Si aparece = tree shaking NO funcionó ❌
// Si NO aparece = tree shaking funcionó ✅
```

---

### 2.4 Circular Dependencies

**Detección:**

**Método 1: Build warnings**

```bash
npm run build

# Output típico:
(!) Circular dependencies
src/store/userStore.ts -> src/services/auth.ts -> src/store/userStore.ts
src/components/Header.tsx -> src/components/Nav.tsx -> src/components/Header.tsx
```

**Método 2: Script de detección**

```javascript
// scripts/detect-circular-deps.mjs
import madge from 'madge'

madge('src/main.tsx', {
  fileExtensions: ['ts', 'tsx'],
  tsConfig: './tsconfig.json'
})
  .then((res) => {
    const circular = res.circular()
    
    if (circular.length > 0) {
      console.error('❌ Circular dependencies found:')
      circular.forEach((path) => {
        console.error('  📦', path.join(' -> '))
      })
      process.exit(1)
    } else {
      console.log('✅ No circular dependencies found')
    }
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
```

```bash
npm install --save-dev madge
node scripts/detect-circular-deps.mjs
```

**Método 3: ESLint plugin**

```javascript
// eslint.config.js
import circularDependency from 'eslint-plugin-import/lib/rules/no-cycle'

export default [
  {
    plugins: {
      import: { rules: { 'no-cycle': circularDependency } }
    },
    rules: {
      'import/no-cycle': ['error', { 
        maxDepth: 10,           // ✅ Profundidad de análisis
        ignoreExternal: true    // ✅ Ignorar node_modules
      }]
    }
  }
]
```

**Soluciones:**

**Ejemplo 1: Store circular dependency**

```typescript
// ❌ Problema
// userStore.ts
import { authService } from '@/services/auth'

export const userStore = create((set) => ({
  login: () => authService.login()
}))

// auth.ts
import { userStore } from '@/store/userStore'

export const authService = {
  login: () => {
    userStore.getState().setUser()  // ❌ Circular
  }
}

// ✅ Solución 1: Dependency Injection
// userStore.ts
export const userStore = create((set) => ({
  login: (authService) => authService.login()  // ✅ Inyectado
}))

// auth.ts
export const authService = {
  login: () => {
    // No importa userStore
  }
}

// ✅ Solución 2: Event bus
// events.ts
export const eventBus = new EventEmitter()

// auth.ts
eventBus.emit('user:login', user)

// userStore.ts
eventBus.on('user:login', (user) => set({ user }))
```

**Ejemplo 2: Component circular dependency**

```typescript
// ❌ Problema
// Header.tsx
import { Nav } from './Nav'
export const Header = () => <Nav />

// Nav.tsx
import { Header } from './Header'
export const Nav = () => <Header />  // ❌ Infinite loop

// ✅ Solución: Composition
// Layout.tsx
import { Header } from './Header'
import { Nav } from './Nav'

export const Layout = () => (
  <>
    <Header />
    <Nav />
  </>
)
```

---

## 3. Environment Variables

### 3.1 .env Debugging

**Estructura de archivos .env:**

```bash
.env                # ✅ Cargado en todos los modos
.env.local          # ✅ Cargado en todos los modos (ignorado por git)
.env.development    # ✅ Solo en dev
.env.production     # ✅ Solo en build
.env.staging        # ✅ Modo custom
```

**Prioridad de carga (mayor a menor):**

```
.env.production.local  (modo específico + local)
.env.production        (modo específico)
.env.local             (local)
.env                   (base)
```

**Ejemplo completo:**

```bash
# .env - Variables base para todos los modos
VITE_APP_NAME=MyApp
VITE_APP_VERSION=1.0.0

# .env.development - Solo en dev (npm run dev)
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# .env.production - Solo en build (npm run build)
VITE_API_URL=https://api.production.com
VITE_DEBUG=false
VITE_LOG_LEVEL=error

# .env.local - Overrides locales (NO commitear)
VITE_API_URL=http://192.168.1.100:3000
DB_PASSWORD=secret123  # ❌ No expuesto (sin VITE_ prefix)
```

**⚠️ IMPORTANTE: Solo variables con prefijo `VITE_` son expuestas al cliente**

```typescript
// ✅ Accesible en el cliente
console.log(import.meta.env.VITE_API_URL)  // "http://localhost:3000"

// ❌ NO accesible (sin prefijo VITE_)
console.log(import.meta.env.DB_PASSWORD)   // undefined

// ✅ Variables built-in siempre disponibles
console.log(import.meta.env.MODE)          // "development" | "production"
console.log(import.meta.env.DEV)           // true en dev
console.log(import.meta.env.PROD)          // true en build
console.log(import.meta.env.BASE_URL)      // "/" (o config.base)
```

---

### 3.2 Build-time vs Runtime Variables

**Build-time (Inlined durante build):**

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    '__APP_VERSION__': JSON.stringify('1.0.0'),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
    '__FEATURE_FLAGS__': JSON.stringify({
      newUI: true,
      betaFeatures: false
    })
  }
})

// En el código (reemplazado en build time)
console.log(__APP_VERSION__)    // Reemplazado por "1.0.0"
console.log(__BUILD_TIME__)     // Reemplazado por "2024-01-15T10:30:00.000Z"
console.log(__FEATURE_FLAGS__)  // Reemplazado por objeto

// ⚠️ IMPORTANTE: Se reemplazan literalmente
if (__FEATURE_FLAGS__.newUI) {   // ✅ Tree-shaken si false
  // Este código se ELIMINA si newUI = false
}
```

**Runtime (Cargado dinámicamente):**

```typescript
// ❌ NO funciona - .env en runtime del servidor
fetch(`${process.env.API_URL}/users`)  // undefined en cliente

// ✅ Funciona - .env variables en build time
fetch(`${import.meta.env.VITE_API_URL}/users`)

// ✅ Runtime config desde servidor
// public/config.js (servido dinámicamente)
window.APP_CONFIG = {
  apiUrl: 'https://api.example.com',
  features: {
    newUI: true
  }
}

// index.html
<script src="/config.js"></script>

// En el código
fetch(`${window.APP_CONFIG.apiUrl}/users`)
```

---

### 3.3 Vite Environment Variables (import.meta.env)

**Variables Built-in:**

```typescript
interface ImportMetaEnv {
  readonly MODE: string           // "development" | "production" | custom
  readonly DEV: boolean           // true si MODE !== "production"
  readonly PROD: boolean          // true si MODE === "production"
  readonly BASE_URL: string       // Base path (config.base)
  readonly SSR: boolean           // true si rendering en servidor
  
  // Custom variables (con VITE_ prefix)
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // ...
}
```

**TypeScript IntelliSense:**

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_DEBUG?: string  // Opcional
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**Debugging .env issues:**

```typescript
// Debug helper component
export const EnvDebug = () => {
  if (import.meta.env.PROD) return null  // ✅ Solo en dev
  
  return (
    <details>
      <summary>🔍 Environment Variables</summary>
      <pre>
        {JSON.stringify(
          {
            MODE: import.meta.env.MODE,
            DEV: import.meta.env.DEV,
            PROD: import.meta.env.PROD,
            BASE_URL: import.meta.env.BASE_URL,
            // ⚠️ Solo mostrar en dev - NO exponer secrets
            VITE_API_URL: import.meta.env.VITE_API_URL,
            VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
          },
          null,
          2
        )}
      </pre>
    </details>
  )
}

// Usar en App.tsx durante desarrollo
<EnvDebug />
```

**Cargar .env en vite.config.ts:**

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // ✅ Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      // ✅ Exponer variable sin prefijo VITE_
      '__API_URL__': JSON.stringify(env.API_URL),
    },
    server: {
      // ✅ Usar en configuración de servidor
      port: env.PORT ? Number(env.PORT) : 5173,
      proxy: {
        '/api': {
          target: env.API_BASE_URL,
          changeOrigin: true
        }
      }
    }
  }
})
```

---

### 3.4 DefinePlugin / define option

**Vite `define` (equivalente a Webpack DefinePlugin):**

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    // ✅ Constantes globales
    '__APP_NAME__': JSON.stringify('MyApp'),
    '__VERSION__': JSON.stringify(process.env.npm_package_version),
    
    // ✅ Feature flags (tree-shaking)
    '__FEATURE_NEW_UI__': true,
    '__FEATURE_BETA__': false,
    
    // ✅ API endpoints
    '__API_ENDPOINT__': JSON.stringify('https://api.example.com'),
    
    // ⚠️ IMPORTANTE: Usar JSON.stringify para strings
    // ❌ 'WRONG': 'value'          // Genera: WRONG = value (error)
    // ✅ 'CORRECT': '"value"'      // Genera: CORRECT = "value"
    // ✅ 'CORRECT': JSON.stringify('value')  // Más seguro
    
    // ✅ Reemplazar process.env.NODE_ENV para librerías que lo usan
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    
    // ✅ Objetos complejos
    '__CONFIG__': JSON.stringify({
      api: {
        url: 'https://api.example.com',
        timeout: 5000
      },
      features: {
        analytics: true,
        debugging: false
      }
    })
  }
})
```

**Uso en código:**

```typescript
// ✅ TypeScript declarations
declare const __APP_NAME__: string
declare const __VERSION__: string
declare const __FEATURE_NEW_UI__: boolean
declare const __CONFIG__: {
  api: { url: string; timeout: number }
  features: { analytics: boolean; debugging: boolean }
}

// Uso
console.log(`${__APP_NAME__} v${__VERSION__}`)

// ✅ Tree shaking con feature flags
if (__FEATURE_NEW_UI__) {
  // Este bloque se ELIMINA si __FEATURE_NEW_UI__ = false
  import('./NewUI').then(mod => mod.render())
}

// ✅ Config accesible
fetch(__CONFIG__.api.url, {
  timeout: __CONFIG__.api.timeout
})
```

**⚠️ Diferencias con Webpack DefinePlugin:**

| Feature | Webpack DefinePlugin | Vite define |
|---------|---------------------|-------------|
| String replacement | Requiere `JSON.stringify()` | Requiere `JSON.stringify()` |
| Object support | ✅ | ✅ |
| Tree shaking | ✅ | ✅ |
| Runtime evaluation | ❌ Build-time only | ❌ Build-time only |
| Regex support | ✅ | ❌ |

---

## 4. Deployment Issues

### 4.1 404s en Assets

**Problema: Assets no cargan después de deploy**

**Síntomas:**
```bash
GET https://myapp.com/assets/index-abc123.js 404 (Not Found)
GET https://myapp.com/assets/logo-def456.png 404 (Not Found)
```

**Causa 1: Base path incorrecto**

```typescript
// ❌ Problema: App desplegada en subdirectorio
// URL: https://example.com/my-app/
// Vite config sin base:
export default defineConfig({})

// Genera paths:
// <script src="/assets/index.js"></script>
// Busca en: https://example.com/assets/index.js ❌

// ✅ Solución: Configurar base
export default defineConfig({
  base: '/my-app/'  // ✅ Debe terminar en /
})

// Genera paths:
// <script src="/my-app/assets/index.js"></script>
// Busca en: https://example.com/my-app/assets/index.js ✅
```

**Configuración dinámica de base:**

```typescript
// vite.config.ts - Base según modo
export default defineConfig(({ mode }) => ({
  base: mode === 'production' 
    ? '/my-app/'      // ✅ Producción en subdirectorio
    : '/'             // ✅ Dev en root
}))

// O desde variable de entorno
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/'
})
```

**Causa 2: Servidor no sirve archivos estáticos**

```nginx
# nginx.conf
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  
  # ✅ Servir archivos estáticos
  location /assets/ {
    try_files $uri =404;
    expires 1y;                    # ✅ Cache largo (tienen hash)
    add_header Cache-Control "public, immutable";
  }
  
  # ✅ HTML sin cache (para invalidación)
  location / {
    try_files $uri $uri/ /index.html;
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
  }
}
```

**Causa 3: Assets inlined por CSP**

```typescript
// vite.config.ts - Problema con CSP
export default defineConfig({
  build: {
    assetsInlineLimit: 4096  // ❌ Default: inline <4KB como data: URIs
  }
})

// ❌ CSP bloquea data: URIs
// Content-Security-Policy: img-src 'self'

// ✅ Solución: Deshabilitar inlining
export default defineConfig({
  build: {
    assetsInlineLimit: 0  // ✅ Nunca inline
  }
})

// O permitir data: URIs en CSP
// Content-Security-Policy: img-src 'self' data:
```

---

### 4.2 Routing Issues en SPA

**Problema: 404 en refresh en rutas de SPA**

**Síntomas:**
```
1. Usuario navega a https://example.com/dashboard ✅ Funciona
2. Usuario hace refresh (F5) ❌ 404 Not Found
```

**Causa:** Servidor busca archivo `/dashboard/index.html` que no existe.

**Soluciones por plataforma:**

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Nginx:**
```nginx
server {
  location / {
    try_files $uri $uri/ /index.html;  # ✅ Fallback a index.html
  }
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Netlify (_redirects):**
```
/*    /index.html   200
```

**Firebase (firebase.json):**
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Express Server:**
```javascript
const express = require('express')
const path = require('path')
const app = express()

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(3000)
```

**Verificar en local (preview):**

```bash
# Build
npm run build

# Preview con servidor que simula producción
npm run preview

# Navegar a http://localhost:4173/dashboard
# Hacer refresh → Debe seguir funcionando ✅
```

---

### 4.3 CORS en Producción

**Problema: API calls funcionan en dev pero no en producción**

**Error típico:**
```
Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Causa:** Proxy de Vite funciona en dev pero no existe en producción.

```typescript
// vite.config.ts - Solo funciona en DEV
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

// En dev:
fetch('/api/users')  // ✅ Proxied a localhost:3000/api/users

// En producción:
fetch('/api/users')  // ❌ Busca en https://myapp.com/api/users (404)
```

**Solución 1: Environment variables**

```typescript
// ✅ Usar URL completa desde .env
const API_URL = import.meta.env.VITE_API_URL

// .env.development
VITE_API_URL=http://localhost:3000

// .env.production
VITE_API_URL=https://api.example.com

// En código:
fetch(`${API_URL}/api/users`)

// Dev: http://localhost:3000/api/users (sin CORS, mismo origin)
// Prod: https://api.example.com/api/users (requiere CORS en servidor)
```

**Solución 2: Configurar CORS en el servidor API**

```javascript
// Express.js
const cors = require('cors')

app.use(cors({
  origin: [
    'http://localhost:5173',      // ✅ Dev
    'https://myapp.com',          // ✅ Producción
    'https://staging.myapp.com'   // ✅ Staging
  ],
  credentials: true,  // ✅ Si usas cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}))
```

**Solución 3: Proxy en producción con Nginx**

```nginx
server {
  listen 80;
  server_name myapp.com;
  
  # Frontend
  location / {
    root /var/www/html;
    try_files $uri /index.html;
  }
  
  # Proxy API
  location /api/ {
    proxy_pass http://localhost:3000/;  # ✅ Mismo origin para browser
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

### 4.4 Cache Invalidation

**Problema: Users ven versión vieja después de deploy**

**Causa:** Browsers cachean HTML y assets agresivamente.

**Solución 1: Cache headers correctos**

```nginx
# nginx.conf
server {
  # ❌ NO cachear HTML (cambia en cada deploy)
  location = /index.html {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    expires -1;
  }
  
  # ✅ Cache largo para assets con hash
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # ⚠️ Cache corto para assets sin hash
  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
    expires 1d;
    add_header Cache-Control "public, must-revalidate";
  }
}
```

**Solución 2: Vite file hashing**

```typescript
// vite.config.ts - Hash en filenames
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // ✅ Hash en chunks JS
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        
        // ✅ Hash en CSS
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})

// Genera:
// assets/index-abc123.js   ✅ Hash único por versión
// assets/vendor-def456.js  ✅ Solo cambia si vendor cambia
// assets/styles-ghi789.css ✅ Hash en CSS también
```

**Solución 3: Service Worker cache busting**

```javascript
// sw.js
const CACHE_VERSION = 'v1.2.0'  // ✅ Incrementar en cada deploy
const CACHE_NAME = `app-cache-${CACHE_VERSION}`

self.addEventListener('activate', (event) => {
  // ✅ Limpiar caches viejos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
})
```

**Solución 4: Meta tags para prevenir cache**

```html
<!-- index.html -->
<head>
  <!-- ✅ Prevenir cache del HTML -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
</head>
```

**Debugging cache issues:**

```bash
# 1. Verificar headers de cache
curl -I https://myapp.com/index.html
# Output:
# Cache-Control: no-cache ✅

curl -I https://myapp.com/assets/index-abc123.js
# Output:
# Cache-Control: public, max-age=31536000, immutable ✅

# 2. Verificar hashes de archivos
ls -la dist/assets/
# Debe mostrar hashes diferentes en cada build

# 3. Force refresh en browser
# Chrome: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
# Firefox: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)

# 4. Clear all site data
# Chrome DevTools → Application → Clear storage → Clear site data
```

---

### 4.5 Source Maps en Producción

**Configuración:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // ✅ Opción 1: Hidden source maps (recomendado)
    sourcemap: 'hidden',  // Genera .map pero no los referencia en .js
    
    // ✅ Opción 2: Source maps completos (solo si es seguro)
    sourcemap: true,
    
    // ⚠️ Opción 3: No source maps (dificulta debugging)
    sourcemap: false,
  }
})
```

**Opciones de sourcemap:**

| Opción | .map generados | Referenciados en .js | Tamaño | Uso |
|--------|----------------|---------------------|--------|-----|
| `false` | ❌ | ❌ | Pequeño | Producción sin debugging |
| `true` | ✅ | ✅ | Grande | Desarrollo/Staging |
| `'hidden'` | ✅ | ❌ | Grande | **Producción recomendado** |
| `'inline'` | ❌ (inline) | ✅ | Enorme | Solo dev |

**Uso recomendado:**

```typescript
export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === 'production' ? 'hidden' : true
  }
}))
```

**Subir source maps a error tracking (Sentry):**

```bash
# .gitignore
dist/**/*.map  # ✅ No commitear source maps

# Upload a Sentry
npx @sentry/cli releases files VERSION upload-sourcemaps ./dist
```

**Configurar Nginx para servir .map solo a IPs autorizadas:**

```nginx
location ~ \.map$ {
  allow 192.168.1.0/24;  # ✅ Solo red interna
  deny all;
  
  # O requerir autenticación
  # auth_basic "Source Maps";
  # auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## 5. Advanced Debugging Techniques

### 5.1 Build Performance Profiling

**Medir tiempo de build:**

```typescript
// vite.config.ts
import { Plugin } from 'vite'

function buildTimerPlugin(): Plugin {
  let startTime: number
  
  return {
    name: 'build-timer',
    buildStart() {
      startTime = Date.now()
      console.log('⏱️ Build started...')
    },
    buildEnd() {
      const duration = Date.now() - startTime
      console.log(`✅ Build completed in ${duration}ms`)
    }
  }
}

export default defineConfig({
  plugins: [buildTimerPlugin()]
})
```

**Profiling detallado:**

```bash
# Vite con debug logging
DEBUG=vite:* npm run build

# Rollup profiling
npm run build -- --profile

# Genera: dist/profile.json
# Abrir en https://chromedevtools.github.io/timeline-viewer/
```

---

### 5.2 Dependency Analysis

**Identificar dependencias que inflan el bundle:**

```bash
# Instalar analizador
npm install --save-dev vite-bundle-analyzer

# Build con análisis
npm run build
```

```typescript
// vite.config.ts
import { analyzer } from 'vite-bundle-analyzer'

export default defineConfig({
  plugins: [
    analyzer({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: true,
    })
  ]
})
```

**Output esperado:**

```
📦 Bundle Analysis
├─ vendor-react (142 KB)
│  ├─ react-dom (120 KB) ⚠️
│  └─ react (22 KB)
├─ vendor-charts (89 KB)
│  ├─ chart.js (75 KB) ⚠️
│  └─ react-chartjs-2 (14 KB)
└─ app (234 KB)
   ├─ src/pages (120 KB)
   ├─ src/components (80 KB)
   └─ src/utils (34 KB)
```

---

### 5.3 Module Federation Debugging

**Para micro-frontends:**

```typescript
// vite.config.ts
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    federation({
      name: 'host-app',
      remotes: {
        remoteApp: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom']
    })
  ]
})

// Debugging remotes
// 1. Verificar que remoteEntry.js carga
// 2. Verificar shared dependencies versions
// 3. Network tab para ver requests
```

---

## 6. Performance Profiling

### 6.1 Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: |
          npm ci
          npm run build
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5000
          uploadArtifacts: true
```

---

### 6.2 Bundle Size Tracking

```json
// package.json
{
  "scripts": {
    "build:analyze": "npm run build && npx vite-bundle-analyzer",
    "build:size": "npm run build && du -sh dist/*"
  }
}
```

**Script para comparar tamaños:**

```bash
#!/bin/bash
# compare-bundles.sh

echo "📊 Comparing bundle sizes..."

# Build actual
npm run build
du -sh dist/ > size-new.txt

# Build anterior (desde git)
git stash
npm run build
du -sh dist/ > size-old.txt
git stash pop

# Comparar
echo "Old size: $(cat size-old.txt)"
echo "New size: $(cat size-new.txt)"

# Calcular diferencia
# ...
```

---

## 7. Checklist de Debugging

### Pre-Build Checklist

- [ ] ✅ `npm install` ejecutado
- [ ] ✅ Cache limpiado (`rm -rf node_modules/.vite`)
- [ ] ✅ TypeScript sin errores (`tsc --noEmit`)
- [ ] ✅ ESLint sin warnings (`npm run lint`)
- [ ] ✅ Tests pasando (`npm test`)
- [ ] ✅ `.env` files configurados

### Build Checklist

- [ ] ✅ `npm run build` exitoso
- [ ] ✅ No warnings de chunk size
- [ ] ✅ Source maps generados (si enabled)
- [ ] ✅ Assets hasheados correctamente
- [ ] ✅ HTML referencia assets correctos

### Post-Build Checklist

- [ ] ✅ `npm run preview` funciona
- [ ] ✅ Todas las rutas SPA accesibles
- [ ] ✅ Assets cargan correctamente
- [ ] ✅ Environment variables correctas
- [ ] ✅ No errores en console

### Deploy Checklist

- [ ] ✅ Base path configurado
- [ ] ✅ Cache headers correctos
- [ ] ✅ SPA rewrites configurados
- [ ] ✅ CORS configurado (si aplica)
- [ ] ✅ Source maps manejados correctamente
- [ ] ✅ Error tracking configurado

---

## 8. Recursos y Herramientas

### Herramientas de Análisis

| Herramienta | Uso | Comando |
|-------------|-----|---------|
| **rollup-plugin-visualizer** | Treemap de bundle | `npm i -D rollup-plugin-visualizer` |
| **vite-bundle-analyzer** | Análisis interactivo | `npm i -D vite-bundle-analyzer` |
| **bundlephobia** | Tamaño de paquetes | https://bundlephobia.com |
| **source-map-explorer** | Análisis de source maps | `npm i -D source-map-explorer` |

### Debug Commands

```bash
# Build verbose
DEBUG=vite:* npm run build

# TypeScript verbose
tsc --noEmit --extendedDiagnostics

# Vite dev con logging
vite --debug --force

# Preview con puerto custom
vite preview --port 8080 --host

# Build con sourcemaps
vite build --sourcemap

# Clear all caches
rm -rf node_modules/.vite node_modules/.tmp dist
```

### VS Code Extensions

- **Error Lens** - Inline error messages
- **Vite** - Syntax highlighting para vite.config
- **Bundle Size** - Ver tamaño de imports
- **Import Cost** - Tamaño en tiempo real

---

## 9. Common Error Reference

| Error | Causa | Solución |
|-------|-------|----------|
| `Could not resolve` | Path alias incorrecto | Verificar tsconfig paths + vite-tsconfig-paths |
| `Failed to parse` | Sintaxis inválida | Revisar JSX/TSX syntax |
| `Circular dependency` | Import circular | Refactor con dependency injection |
| `ENOENT` | Case sensitivity | Corregir imports exact case |
| `Failed to fetch` | 404 en chunk | Verificar base path + routing |
| `CORS error` | Política CORS | Configurar headers en API |
| `Module format error` | CJS vs ESM | Usar optimizeDeps.include |
| `Out of memory` | Bundle muy grande | Split chunks + increase heap |

---

## 10. Referencias

### Documentación Oficial
- [Vite Build Guide](https://vite.dev/guide/build.html)
- [Vite Troubleshooting](https://vite.dev/guide/troubleshooting.html)
- [Vite Env Variables](https://vite.dev/guide/env-and-mode.html)
- [Rollup Configuration](https://rollupjs.org/configuration-options/)

### Best Practices
- [Vite Performance Guide](https://vite.dev/guide/performance.html)
- [Frontend Deployment Guide](https://vite.dev/guide/static-deploy.html)
- [Bundle Optimization Patterns](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)

---

**Última actualización:** Diciembre 2024  
**Versión del proyecto:** Vite 7.1.9 + React 19 + TypeScript 5.8
