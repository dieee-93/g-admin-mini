# 🧭 GUÍA PRÁCTICA: SISTEMA DE NAVEGACIÓN DINÁMICO
## G-Admin Mini - ModuleRegistry Navigation System

**Versión**: 2.0 (Post-Refactorización)
**Última Actualización**: 2025-10-12
**Estado**: ✅ Producción

---

## 📋 TABLA DE CONTENIDOS

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Cómo Agregar un Nuevo Módulo](#cómo-agregar-un-nuevo-módulo)
4. [Sistema de Dominios](#sistema-de-dominios)
5. [Filtrado por Roles y Capabilities](#filtrado-por-roles-y-capabilities)
6. [Hooks Disponibles](#hooks-disponibles)
7. [Troubleshooting](#troubleshooting)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 📖 INTRODUCCIÓN

### ¿Qué es?

El Sistema de Navegación Dinámico es la arquitectura que genera automáticamente la navegación de G-Admin Mini a partir de los manifests de módulos registrados en ModuleRegistry.

### Características Clave

- ✅ **Única Fuente de Verdad**: ModuleRegistry genera toda la navegación
- ✅ **Auto-sincronizado**: Agregar módulo = solo crear manifest
- ✅ **Agrupado por Dominios**: Navegación organizada por áreas de negocio
- ✅ **Filtrado Inteligente**: Roles (seguridad) + Capabilities (lógica de negocio)
- ✅ **Type-Safe**: Full TypeScript con validación en tiempo de compilación

### Flujo de Datos

```
src/modules/{module}/manifest.tsx
  ↓ (metadata.navigation)
ModuleRegistry.bootstrap()
  ↓ (registro)
useModuleNavigation() hook
  ↓ (generación)
NavigationContext filters
  ↓ (roles + capabilities)
Sidebar.tsx renderizado
  ↓ (agrupado por dominios)
Usuario ve navegación
```

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Componentes Principales

#### 1. Module Manifest (Fuente de Verdad)
**Ubicación**: `src/modules/{module}/manifest.tsx`

Cada módulo define su metadata de navegación:

```typescript
export const myModuleManifest: ModuleManifest = {
  id: 'my-module',
  name: 'My Module',
  version: '1.0.0',

  metadata: {
    category: 'business',
    description: 'Module description',
    navigation: {                    // ← CLAVE para navegación
      route: '/admin/my-module',     // Ruta del módulo
      icon: MyIcon,                   // Icono de Heroicons
      color: 'blue',                  // Color del módulo
      domain: 'supply-chain',         // Dominio de agrupación
      isExpandable: false             // ¿Tiene submódulos?
    }
  }
};
```

#### 2. ModuleRegistry
**Ubicación**: `src/lib/modules/ModuleRegistry.ts`

Singleton que:
- Registra todos los manifests
- Valida dependencias
- Provee acceso a metadata

#### 3. useModuleNavigation Hook
**Ubicación**: `src/lib/modules/useModuleNavigation.ts`

Genera navegación dinámica:

```typescript
export function useModuleNavigation(): NavigationModule[] {
  const registry = getModuleRegistry();
  const manifests = registry.getRegisteredModules();

  // Convierte manifests → estructura de navegación
  return manifests
    .filter(m => m.metadata?.navigation)
    .map(m => ({
      id: m.id,
      title: m.name,
      path: m.metadata.navigation.route,
      icon: m.metadata.navigation.icon,
      // ...
    }));
}
```

#### 4. NavigationContext
**Ubicación**: `src/contexts/NavigationContext.tsx`

Consume el hook y aplica filtros:

```typescript
const adminModulesFromRegistry = useModuleNavigation();

const accessibleModules = useMemo(() => {
  // Filtrado por roles + capabilities
  return adminModulesFromRegistry.filter(module => {
    // Layer 1: Role-based security
    const hasRole = canAccessModule(module.id);

    // Layer 2: Capability-based filter
    const hasCapability = activeModules.includes(module.id);

    return hasRole && hasCapability;
  });
}, [adminModulesFromRegistry, canAccessModule, activeModules]);
```

#### 5. Sidebar Component
**Ubicación**: `src/shared/navigation/Sidebar.tsx`

Renderiza navegación agrupada por dominios.

---

## ➕ CÓMO AGREGAR UN NUEVO MÓDULO

### Paso 1: Crear el Módulo

```bash
src/pages/admin/{domain}/{module-name}/
├── page.tsx              # Componente principal
├── components/           # Componentes del módulo
├── hooks/                # Hooks del módulo
├── services/             # Servicios (API, lógica)
└── types/                # TypeScript types
```

### Paso 2: Crear el Manifest

**Ubicación**: `src/modules/{module-name}/manifest.tsx`

```typescript
import { logger } from '@/lib/logging';
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
import { MyModuleIcon } from '@heroicons/react/24/outline';

export const myModuleManifest: ModuleManifest = {
  // ============================================
  // CORE METADATA
  // ============================================

  id: 'my-module',              // ID único (kebab-case)
  name: 'My Module',            // Nombre visible
  version: '1.0.0',             // Versión semántica

  // ============================================
  // DEPENDENCIES
  // ============================================

  depends: ['materials'],       // Módulos requeridos (si hay)
  autoInstall: false,           // Auto-activar cuando dependencias activas

  // ============================================
  // FEATURE REQUIREMENTS
  // ============================================

  requiredFeatures: [           // Features obligatorias
    'my_feature_required'
  ] as FeatureId[],

  optionalFeatures: [           // Features opcionales
    'my_feature_optional'
  ] as FeatureId[],

  // ============================================
  // HOOK POINTS (Opcional)
  // ============================================

  hooks: {
    provide: [
      'my-module.data_created',
      'dashboard.widgets'
    ],
    consume: [
      'materials.stock_updated'
    ]
  },

  // ============================================
  // SETUP & TEARDOWN (Opcional)
  // ============================================

  setup: async (registry) => {
    logger.info('App', '🚀 Setting up My Module');
    // Registrar hooks, listeners, etc.
  },

  teardown: async () => {
    logger.info('App', '🧹 Tearing down My Module');
    // Cleanup
  },

  // ============================================
  // PUBLIC API (Opcional)
  // ============================================

  exports: {
    getData: async () => { /* ... */ }
  },

  // ============================================
  // METADATA (CRÍTICO PARA NAVEGACIÓN)
  // ============================================

  metadata: {
    category: 'business',
    description: 'Brief description of module functionality',
    author: 'G-Admin Team',
    tags: ['tag1', 'tag2'],

    // ⭐ NAVEGACIÓN - CLAVE PARA APARECER EN SIDEBAR
    navigation: {
      route: '/admin/my-module',    // Ruta completa
      icon: MyModuleIcon,            // Icono de @heroicons/react/24/outline
      color: 'blue',                 // Color: blue, green, purple, red, etc.
      domain: 'supply-chain',        // Dominio de agrupación (ver tabla)
      isExpandable: false            // true si tiene submódulos
    }
  }
};

export default myModuleManifest;
```

### Paso 3: Registrar en ALL_MODULE_MANIFESTS

**Ubicación**: `src/modules/index.ts`

```typescript
import { myModuleManifest } from './my-module/manifest';

export const ALL_MODULE_MANIFESTS = [
  // ... otros manifests
  myModuleManifest,  // ← Agregar aquí
];

export {
  // ... otros exports
  myModuleManifest,  // ← Export nombrado
};
```

### Paso 4: Agregar Ruta en App.tsx

**Ubicación**: `src/App.tsx`

```typescript
<Route
  path="/admin/my-module"
  element={<LazyMyModulePage />}
/>
```

### Paso 5: Configurar Lazy Loading

**Ubicación**: `src/lib/lazy/LazyModules.ts`

```typescript
export const LazyMyModulePage = createLazyComponent(
  () => import('../../pages/admin/{domain}/my-module/page'),
  'my-module',
  {
    chunkName: 'my-module',
    retryAttempts: 3
  }
);
```

### Paso 6: Agregar a FeatureRegistry (Opcional si requiere capabilities)

**Ubicación**: `src/config/FeatureRegistry.ts`

```typescript
export const MODULE_FEATURE_MAP: Record<string, ModuleFeatureConfig> = {
  // ... otros módulos

  'my-module': {
    requiredFeatures: ['my_feature_required'],
    optionalFeatures: ['my_feature_optional'],
    alwaysActive: false,    // true si siempre debe estar visible
    description: 'My Module description'
  }
};
```

### ✅ Resultado

Al reiniciar la app:
1. ✅ ModuleRegistry registra el manifest
2. ✅ `useModuleNavigation()` detecta `metadata.navigation`
3. ✅ Sidebar muestra el módulo bajo el dominio especificado
4. ✅ Click navega a `/admin/my-module`

**No se requiere editar NavigationContext ni Sidebar manualmente.**

---

## 🗂️ SISTEMA DE DOMINIOS

### Dominios Disponibles

| Domain ID | Label | Descripción | Módulos Ejemplo |
|-----------|-------|-------------|-----------------|
| `core` | Core | Funcionalidad central | Dashboard, Settings |
| `supply-chain` | Supply Chain | Cadena de suministro | Materials, Products, Suppliers |
| `operations` | Operations | Operaciones diarias | Sales, Operations, Customers |
| `finance` | Finance | Gestión financiera | Fiscal, Billing |
| `resources` | Resources | Recursos humanos | Staff, Scheduling |
| `advanced` | Advanced | Features empresariales | Executive BI, Advanced Tools |
| `debug` | Debug | Herramientas de desarrollo | Debug Tools (SUPER_ADMIN) |

### Cómo se Agrupan los Módulos

El Sidebar renderiza módulos en este orden:

```
🏢 CORE
  └─ Módulos con domain: 'core'

🏭 SUPPLY CHAIN
  └─ Módulos con domain: 'supply-chain'

💰 OPERATIONS
  └─ Módulos con domain: 'operations'

📊 FINANCE
  └─ Módulos con domain: 'finance'

👥 RESOURCES
  └─ Módulos con domain: 'resources'

🎮 ADVANCED
  └─ Módulos con domain: 'advanced'

🔧 DEBUG (solo SUPER_ADMIN)
  └─ Módulos con domain: 'debug'
```

### Separadores Visuales

Entre cada dominio, el Sidebar renderiza:
- Separador horizontal (línea sutil)
- Label del dominio (uppercase, gray, small)

Esto mejora la escaneabilidad visual.

---

## 🔐 FILTRADO POR ROLES Y CAPABILITIES

### Layer 1: Role-Based Security (AuthContext)

```typescript
// NavigationContext.tsx
const hasRoleAccess = canAccessModule(module.id);
```

Módulos filtrados según rol del usuario:
- **SUPER_ADMIN**: Acceso a todos los módulos
- **ADMIN**: Acceso a módulos de negocio
- **STAFF**: Acceso limitado según permisos
- **CLIENTE**: Solo módulos de customer portal

### Layer 2: Capability-Based Filter (FeatureRegistry)

```typescript
// NavigationContext.tsx
const hasCapabilityAccess = activeModules.includes(module.id);
```

Módulos visibles según capabilities activas:
- **alwaysActive: true**: Siempre visible (dashboard, settings)
- **alwaysActive: false**: Requiere feature flag activa

### Ejemplo Completo

```typescript
// Usuario ADMIN con capabilities: ['inventory_supplier_management']

// Módulo 1: Suppliers
{
  id: 'suppliers',
  requiredFeatures: ['inventory_supplier_management'], // ✅ Cumple
  metadata: { navigation: { ... } }
}
// Resultado: ✅ VISIBLE

// Módulo 2: Executive BI
{
  id: 'executive',
  requiredFeatures: ['executive_advanced_bi'], // ❌ No cumple
  metadata: { navigation: { ... } }
}
// Resultado: ❌ OCULTO
```

---

## 🪝 HOOKS DISPONIBLES

### useModuleNavigation()

**Descripción**: Genera lista completa de módulos con metadata de navegación

**Uso**:
```typescript
import { useModuleNavigation } from '@/lib/modules/useModuleNavigation';

function MyComponent() {
  const modules = useModuleNavigation();

  return (
    <ul>
      {modules.map(mod => (
        <li key={mod.id}>{mod.title}</li>
      ))}
    </ul>
  );
}
```

**Retorna**: `NavigationModule[]`

---

### useModuleNavigationByDomain()

**Descripción**: Genera módulos agrupados por dominio

**Uso**:
```typescript
import { useModuleNavigationByDomain } from '@/lib/modules/useModuleNavigation';

function MyComponent() {
  const modulesByDomain = useModuleNavigationByDomain();

  return (
    <div>
      {Object.entries(modulesByDomain).map(([domain, modules]) => (
        <div key={domain}>
          <h3>{domain}</h3>
          <ul>
            {modules.map(mod => (
              <li key={mod.id}>{mod.title}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

**Retorna**: `Record<Domain, NavigationModule[]>`

---

### useNavigation() (Context Hook)

**Descripción**: Acceso completo al contexto de navegación

**Uso**:
```typescript
import { useNavigation } from '@/contexts/NavigationContext';

function MyComponent() {
  const {
    modules,              // Módulos filtrados visibles
    currentModule,        // Módulo activo
    navigate,             // Función de navegación
    navigateToModule,     // Navegar a módulo por ID
    sidebarCollapsed,     // Estado del sidebar
    toggleModuleExpansion // Toggle de expansión
  } = useNavigation();

  return <div>{currentModule?.title}</div>;
}
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Mi módulo no aparece en Sidebar"

**Checklist**:
1. ✅ ¿El manifest tiene `metadata.navigation` completo?
2. ✅ ¿El módulo está en `ALL_MODULE_MANIFESTS`?
3. ✅ ¿La ruta existe en `App.tsx`?
4. ✅ ¿El módulo está en `MODULE_FEATURE_MAP`?
5. ✅ ¿El usuario tiene la capability requerida activa?
6. ✅ ¿El rol del usuario puede acceder al módulo?

**Debug**:
```typescript
// Agrega en NavigationContext.tsx después de useModuleNavigation()
console.log('Modules from registry:', adminModulesFromRegistry);
console.log('Active modules:', activeModules);
console.log('Accessible modules:', accessibleModules);
```

---

### Problema: "Error de TypeScript en manifest"

**Solución**: Asegúrate de importar tipos correctos

```typescript
import type { ModuleManifest } from '@/lib/modules/types';
import type { FeatureId } from '@/config/types';
```

**Validación**:
```bash
pnpm -s exec tsc --noEmit
```

---

### Problema: "Módulo visible pero ruta 404"

**Checklist**:
1. ✅ ¿La ruta en manifest coincide con la ruta en App.tsx?
2. ✅ ¿El lazy component existe en LazyModules.ts?
3. ✅ ¿El archivo page.tsx existe en la ubicación correcta?

**Ejemplo Correcto**:
```typescript
// Manifest
navigation: { route: '/admin/my-module' }

// App.tsx
<Route path="/admin/my-module" element={<LazyMyModulePage />} />

// LazyModules.ts
export const LazyMyModulePage = createLazyComponent(
  () => import('../../pages/admin/{domain}/my-module/page'),
  'my-module'
);

// Archivo existe
src/pages/admin/{domain}/my-module/page.tsx ✅
```

---

### Problema: "Módulo siempre oculto aunque capability está activa"

**Posible Causa**: `MODULE_FEATURE_MAP` no configurado

**Solución**:
```typescript
// FeatureRegistry.ts
'my-module': {
  optionalFeatures: ['my_feature'],
  alwaysActive: false,  // ← o true si debe estar siempre visible
  description: 'My module'
}
```

---

## 💡 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Módulo Simple sin Dependencias

```typescript
// src/modules/reports/manifest.tsx
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

export const reportsManifest: ModuleManifest = {
  id: 'reports',
  name: 'Reports',
  version: '1.0.0',

  depends: [],
  requiredFeatures: [] as FeatureId[],

  metadata: {
    category: 'business',
    description: 'Business reports and analytics',
    navigation: {
      route: '/admin/reports',
      icon: DocumentChartBarIcon,
      color: 'purple',
      domain: 'advanced',
      isExpandable: false
    }
  }
};
```

**Resultado**: Visible en Sidebar → Advanced → Reports

---

### Ejemplo 2: Módulo con Dependencias

```typescript
// src/modules/production/manifest.tsx
export const productionManifest: ModuleManifest = {
  id: 'production',
  name: 'Production',
  version: '1.0.0',

  depends: ['materials', 'products'],  // ← Requiere materials y products
  autoInstall: true,                    // ← Auto-activa si dependencias activas

  metadata: {
    navigation: {
      route: '/admin/production',
      icon: CogIcon,
      color: 'orange',
      domain: 'supply-chain',
      isExpandable: false
    }
  }
};
```

**Comportamiento**:
- Solo visible si `materials` y `products` están activos
- Se activa automáticamente cuando dependencias se activan

---

### Ejemplo 3: Módulo con Submódulos (Expandible)

```typescript
// src/modules/analytics/manifest.tsx
export const analyticsManifest: ModuleManifest = {
  id: 'analytics',
  name: 'Analytics',
  version: '1.0.0',

  metadata: {
    navigation: {
      route: '/admin/analytics',
      icon: ChartBarIcon,
      color: 'blue',
      domain: 'core',
      isExpandable: true,  // ← Indica que tiene submódulos
      subModules: [
        {
          id: 'sales-analytics',
          title: 'Sales Analytics',
          path: '/admin/analytics/sales',
          icon: CurrencyDollarIcon
        },
        {
          id: 'inventory-analytics',
          title: 'Inventory Analytics',
          path: '/admin/analytics/inventory',
          icon: CubeIcon
        }
      ]
    }
  }
};
```

**Resultado**: Módulo expandible con flecha, muestra submódulos al expandir

---

### Ejemplo 4: Módulo Always Active (Dashboard, Settings)

```typescript
// FeatureRegistry.ts
'dashboard': {
  alwaysActive: true,  // ← Siempre visible, sin filtro de capabilities
  description: 'Main dashboard'
}
```

**Uso**: Para módulos core que deben estar siempre accesibles.

---

## 📚 REFERENCIAS

### Archivos Clave

- **Manifests**: `src/modules/*/manifest.tsx`
- **Registry**: `src/lib/modules/ModuleRegistry.ts`
- **Hooks**: `src/lib/modules/useModuleNavigation.ts`
- **Context**: `src/contexts/NavigationContext.tsx`
- **Sidebar**: `src/shared/navigation/Sidebar.tsx`
- **Features**: `src/config/FeatureRegistry.ts`

### Documentación Relacionada

- `CLAUDE.md` - Arquitectura general del proyecto
- `docs/02-architecture/MODULE_REGISTRY_MIGRATION_PLAN.md` - Plan de migración
- `NAVIGATION_AUDIT_RESOLUTION_REPORT.md` - Reporte de refactorización

### Ejemplos de Manifests Existentes

- `src/modules/materials/manifest.tsx` - Módulo simple
- `src/modules/suppliers/manifest.tsx` - Módulo con hooks
- `src/modules/scheduling/manifest.tsx` - Módulo con dependencias
- `src/modules/sales/manifest.tsx` - Módulo con submódulos

---

## ✅ CHECKLIST DE DESARROLLO

Al crear un nuevo módulo, verifica:

- [ ] Manifest creado en `src/modules/{module}/manifest.tsx`
- [ ] `metadata.navigation` completo con route, icon, color, domain
- [ ] Agregado a `ALL_MODULE_MANIFESTS` en `src/modules/index.ts`
- [ ] Ruta agregada en `App.tsx`
- [ ] Lazy component configurado en `LazyModules.ts`
- [ ] Página principal creada en `src/pages/admin/{domain}/{module}/page.tsx`
- [ ] (Opcional) Entrada en `MODULE_FEATURE_MAP` si requiere capabilities
- [ ] TypeScript valida sin errores (`pnpm -s exec tsc --noEmit`)
- [ ] ESLint pasa sin errores (`pnpm lint`)
- [ ] Módulo visible en Sidebar bajo dominio correcto
- [ ] Navegación funciona correctamente

---

**Guía creada**: 2025-10-12
**Autor**: Claude Code (Anthropic)
**Versión del Sistema**: 2.0 (Post-Refactorización)
**Última Revisión**: 2025-10-12
