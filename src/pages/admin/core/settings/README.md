# Módulo de Settings - G-Admin Mini

## 📋 Descripción del Módulo

El módulo de **Settings** gestiona la configuración central del negocio, incluyendo el perfil de la empresa, configuraciones fiscales, roles de usuario e integraciones del sistema. Proporciona un centro de comando unificado para administrar todos los aspectos operativos y técnicos de G-Admin Mini.

### Características principales:
- ✅ Gestión del Perfil Empresarial
- ✅ Configuración de Impuestos y Cumplimiento Fiscal
- ✅ Administración de Roles y Permisos de Usuario
- ✅ Configuración de Integraciones con servicios de terceros
- ✅ Configuración del Sistema y Preferencias
- ✅ Centro de métricas y estado general

---

## 🏗️ Estructura Estándar de Módulo

Esta estructura representa nuestro **patrón oficial** para todos los módulos de G-Admin Mini:

```
src/pages/admin/core/settings/
├── README.md                   # 📖 Este archivo (documentación completa)
├── page.tsx                    # 🎯 Página orquestadora (componente principal)
│
├── components/                 # 🧩 Componentes UI específicos del módulo
│   ├── index.ts               # 📦 Barrel exports
│   ├── BusinessProfile/       # 🏢 Configuración del perfil empresarial
│   ├── TaxConfiguration/      # 💰 Configuración fiscal y de impuestos
│   ├── UserPermissions/       # 👥 Gestión de roles y permisos
│   ├── System/                # ⚙️ Configuración del sistema
│   └── Enterprise/            # 🚀 Funcionalidades empresariales
│
├── hooks/                     # 🪝 Hooks de negocio y página
│   ├── index.ts              # 📦 Barrel exports
│   ├── useSettingsPage.ts    # 🎭 Hook orquestador de la página
│   └── [otros hooks]/        # 🔧 Hooks específicos
│
├── services/                  # ⚙️ Lógica de negocio y servicios
│   ├── index.ts              # 📦 Barrel exports
│   ├── settingsApi.ts        # 🌐 API calls y gestión de datos
│   └── [otros servicios]/    # 🔧 Servicios adicionales
│
├── types/                    # 🏷️ Definiciones TypeScript
│   ├── index.ts             # 📦 Barrel exports
│   ├── profile.ts           # 🏢 Tipos de perfil empresarial
│   ├── tax.ts               # 💰 Tipos de configuración fiscal
│   ├── system.ts            # ⚙️ Tipos de configuración del sistema
│   └── permissions.ts       # 👥 Tipos de roles y permisos
│
└── utils/                   # 🛠️ Utilidades específicas del módulo
    ├── index.ts            # 📦 Barrel exports
    └── [utilidades]/       # 🔧 Helper functions
```

---

## 🎯 Patrón "Página Orquestadora"

### Concepto
El archivo `page.tsx` actúa como un **orquestador limpio** que:
- ✅ No contiene lógica de negocio
- ✅ Usa componentes semánticos del sistema de diseño
- ✅ Delega la lógica a hooks especializados
- ✅ Mantiene una estructura clara y consistente

### Implementación Actual

```tsx
// src/pages/admin/core/settings/page.tsx
export default function SettingsPage() {
  // 🎭 Toda la lógica delegada al hook orquestador
  const { metrics, handlers, icons } = useSettingsPage();

  return (
    <ContentLayout>
      {/* 📋 Header semántico con acciones */}
      <PageHeader 
        title="Configuración"
        subtitle="Centro de comando · G-Admin"
        icon={icons.CogIcon}
        actions={
          <Button size="md" onClick={handlers.handleSaveSettings}>
            <Icon icon={icons.CogIcon} size="sm" />
            Guardar Cambios
          </Button>
        }
      />

      {/* 📊 Métricas del estado general */}
      <StatsSection>
        <CardGrid columns={{ base: 1, md: 4 }}>
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
            />
          ))}
        </CardGrid>
      </StatsSection>

      {/* 🧩 Secciones semánticas para cada funcionalidad */}
      <BusinessProfileSection />
      <TaxConfigurationSection />
      <UserPermissionsSection />
      <SystemSection />
    </ContentLayout>
  );
}
```

### Hook Orquestador

```tsx
// src/pages/admin/core/settings/hooks/useSettingsPage.ts
export function useSettingsPage() {
  const { setQuickActions } = useNavigation();

  // 🚀 Configurar acciones rápidas del header global
  useEffect(() => {
    setQuickActions([
      {
        id: 'save-settings',
        label: 'Guardar Configuración',
        icon: CogIcon,
        action: () => handleSaveSettings(),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  // 📊 Métricas del dashboard
  const metrics = [
    {
      title: "Perfil Empresarial",
      value: "Completo",
      subtitle: "Información actualizada",
      icon: BuildingOfficeIcon
    },
    // ... más métricas
  ];

  // 🎯 Handlers de acciones específicas
  const handleSaveSettings = () => {
    console.log('Save settings');
    // TODO: Implementar lógica de guardado
  };

  return {
    metrics,
    handlers: { handleSaveSettings },
    icons: { CogIcon, BuildingOfficeIcon, /* ... */ }
  };
}
```

---

## 🎨 Sistema de Diseño Integrado

### Componentes Semánticos Obligatorios

```tsx
import {
  // 🏗️ Componentes de Layout Semánticos (PRIORIDAD)
  ContentLayout,    // Estructura principal de página
  PageHeader,       // Header con título, subtítulo y acciones
  Section,          // Secciones con variants (elevated/flat/default)
  StatsSection,     // Contenedor para métricas

  // 🧩 Componentes Base
  Button, Modal, Alert, Badge, Switch,

  // 📊 Componentes de Negocio
  MetricCard, CardGrid
} from '@/shared/ui'
```

### Reglas de Diseño
1. **❌ NUNCA** importar de `@chakra-ui/react` directamente
2. **✅ SIEMPRE** usar `ContentLayout` como contenedor principal
3. **✅ USAR** `PageHeader` para títulos complejos con acciones
4. **✅ APLICAR** `Section` con variants apropiados
5. **✅ DELEGAR** theming automático (tokens `gray.*`)

---

## 🧠 Arquitectura de Lógica de Negocio

### Separación de Responsabilidades

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   page.tsx      │───▶│     hooks/      │───▶│   services/     │
│  (Orquestador)  │    │ (Estado/Efectos)│    │ (Lógica Pura)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   🎭 UI Structure        🪝 State Management     ⚙️ Business Logic
```

### Tipos de Hooks

1. **Hook Orquestador** (`useSettingsPage.ts`)
   - 🎯 Maneja el estado de la página completa
   - 🚀 Configura acciones rápidas globales
   - 🎭 Coordina interacciones entre componentes

2. **Hooks de Negocio** (futuros)
   - 📊 Encapsula lógica específica de funcionalidades
   - 🔄 Maneja llamadas a servicios
   - 📡 Gestiona estado local de componentes

### Servicios Modulares

```typescript
// services/settingsApi.ts
export class SettingsService {
  // 🏢 Gestión del perfil empresarial
  static async updateBusinessProfile(profile: BusinessSettings): Promise<void>
  
  // 💰 Configuración fiscal
  static async updateTaxSettings(taxConfig: TaxSettings): Promise<void>
  
  // 👥 Gestión de permisos
  static async updateUserPermissions(permissions: UserPermissions[]): Promise<void>
}
```

---

## 🔄 Integración con EventBus

### Eventos del Módulo

```typescript
// Eventos que emite el módulo
const SETTINGS_EVENTS = {
  BUSINESS_PROFILE_UPDATED: 'settings:business_profile_updated',
  TAX_CONFIG_UPDATED: 'settings:tax_config_updated',
  PERMISSIONS_CHANGED: 'settings:permissions_changed',
  SYSTEM_CONFIG_UPDATED: 'settings:system_config_updated'
} as const;

// Eventos que escucha el módulo
const SUBSCRIBED_EVENTS = [
  'user:role_added',                    // Actualizar lista de roles
  'system:new_integration_available',   // Mostrar nuevas integraciones
  'auth:permissions_changed'            // Refrescar permisos
] as const;
```

---

## 📊 Testing Strategy

### Estructura de Tests

```
src/pages/admin/core/settings/
├── __tests__/
│   ├── page.test.tsx                    # Tests del componente principal
│   ├── components/
│   │   ├── BusinessProfile.test.tsx     # Tests de componentes
│   │   ├── TaxConfiguration.test.tsx
│   │   ├── UserPermissions.test.tsx
│   │   └── System.test.tsx
│   ├── hooks/
│   │   └── useSettingsPage.test.ts      # Tests de hooks
│   └── services/
│       └── settingsApi.test.ts          # Tests de servicios
```

---

## 🚀 Cómo Replicar este Patrón

### Checklist para Nuevo Módulo

1. **📁 Crear estructura de carpetas**
   ```bash
   mkdir -p components hooks services types utils
   touch README.md page.tsx
   touch components/index.ts hooks/index.ts services/index.ts
   ```

2. **🎯 Implementar página orquestadora**
   - Usar `ContentLayout + PageHeader + Section`
   - Extraer lógica a hook orquestador
   - Componentes simples y semánticos

3. **🪝 Crear hooks especializados**
   - Hook orquestador para la página
   - Hooks de negocio para funcionalidades específicas
   - Estado local vs estado global bien definido

4. **⚙️ Desarrollar servicios**
   - Lógica de negocio pura
   - API calls centralizados
   - Gestión de configuraciones

5. **📝 Documentar el módulo**
   - Copiar este README.md
   - Adaptar contenido específico
   - Mantener estructura estándar

---

## 🔗 Referencias Técnicas

### Dependencias Clave
- **Zustand**: State management global
- **ChakraUI v3**: Sistema de componentes base
- **React Query**: Data fetching y cache
- **Heroicons**: Iconografía consistente
- **Supabase**: Backend y autenticación

### Patrones Aplicados
- ✅ **Separation of Concerns**: UI, Estado, Lógica
- ✅ **Composition over Inheritance**: Componentes reutilizables
- ✅ **Domain-Driven Design**: Estructura por dominios de negocio
- ✅ **Event-Driven Architecture**: Comunicación entre módulos
- ✅ **Configuration as Code**: Gestión centralizada de configuraciones

---

## 📈 Métricas de Calidad

### Indicadores de Éxito
- ⚡ **Performance**: Carga < 200ms, operaciones < 50ms
- 🧪 **Testing**: Cobertura > 80%, tests unitarios + integración
- 📦 **Bundle Size**: Incremento < 50KB por módulo
- 🔧 **Mantenibilidad**: Complejidad ciclomática < 10
- 🎨 **UX Consistency**: 100% componentes del design system

### Validación Técnica
```bash
# Comandos de verificación
npm run typecheck     # Sin errores TypeScript
npm run lint         # Sin warnings ESLint
npm run test:unit    # Todos los tests pasan
npm run build        # Build exitoso
```

---

**🎯 Este README.md representa nuestro estándar oficial de módulos en G-Admin Mini.**

**📋 Para crear un nuevo módulo, copia este archivo y adapta el contenido específico manteniendo la estructura y patrones documentados.**