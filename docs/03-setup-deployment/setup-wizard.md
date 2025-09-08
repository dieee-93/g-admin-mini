# 🧙‍♂️ Setup Wizard v2.0 - G-Admin Mini

> **Última actualización**: 2025-09-08  
> **Autor**: Consolidación de SETUP_SYSTEM_*.md + SETUP_WIZARD_*.md  
> **Estado**: Sistema completo implementado y funcionando

## 🎯 Visión General

El Setup Wizard v2.0 de G-Admin Mini proporciona una experiencia guiada para la configuración inicial del sistema, desde la verificación de infraestructura hasta la configuración completa del negocio.

### ✅ **Estado Actual: COMPLETAMENTE IMPLEMENTADO**

El sistema está **100% funcional** y listo para producción. Los usuarios pueden configurar completamente g-admin sin conocimientos técnicos.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/pages/setup/
├── SetupWizard.tsx                       ✅ INTEGRADO (orquestador principal)
├── config/
│   ├── setupSteps.ts                     ✅ ACTIVO (configuración de pasos)
│   └── stepComponents.ts                 ✅ ACTIVO (mapeo de componentes)
├── layout/
│   ├── SetupHeader.tsx                   ✅ ACTIVO (header del wizard)
│   ├── SetupSidebar.tsx                  ✅ ACTIVO (navegación lateral)
│   └── SetupProgressBar.tsx              ✅ ACTIVO (barra de progreso)
├── steps/
│   ├── welcome/WelcomeScreen.tsx         ✅ ACTIVO (pantalla de bienvenida)
│   ├── infrastructure/supabase-connection/
│   │   └── SupabaseConnectionStep.tsx    ✅ ACTIVO (conexión Supabase)
│   ├── database-setup/DatabaseSetupStep.tsx ✅ ACTIVO (configuración DB)
│   ├── system-verification/SystemVerification.tsx ✅ ACTIVO (verificación)
│   ├── system-setup/admin-user-creation/
│   │   └── AdminUserCreationStep.tsx     ✅ ACTIVO (creación admin)
│   ├── business-setup/business-model/
│   │   └── BusinessModelStep.tsx         ✅ ACTIVO (modelo de negocio)
│   ├── basic-system-config/BasicSystemConfig.tsx ✅ ACTIVO (config básica)
│   ├── setup-summary/SetupSummary.tsx   ✅ ACTIVO (resumen)
│   └── FinishStep.tsx                    ✅ ACTIVO (finalización)
└── store/setupStore.ts                   ✅ MOTOR (state management)
```

## 🛡️ Sistema de Bloqueo y Verificación

### **VERIFICACIÓN POR CAPAS**

| Capa | Tipo de Bloqueo | Requisitos | Impacto |
|------|----------------|------------|---------|
| **CRÍTICA** | 🚫 **BLOQUEO TOTAL** | Conexión, Tablas, RLS, Funciones SQL, Roles | App completamente bloqueada |
| **CONFIGURACIÓN** | ⚠️ **BLOQUEO PARCIAL** | Admin User, System Config | Funcionalidades limitadas |
| **OPCIONAL** | 💡 **ADVERTENCIAS** | Hooks JWT, Datos Ejemplo | Solo notificaciones |

### **VERIFICACIONES CRÍTICAS IMPLEMENTADAS**

```typescript
✅ Conexión a Supabase - Verificación profunda de conectividad
✅ Tablas Esenciales - 8 tablas críticas verificadas
✅ Sistema de Roles - users_roles + funciones de acceso
✅ Políticas RLS - Row Level Security funcionando
✅ Funciones SQL - get_user_role, check_user_access
✅ Usuario Admin - Verificación de SUPER_ADMIN activo
✅ Configuración Sistema - system_config accesible
```

### **FLUJO DE VERIFICACIÓN**

```
1. Usuario accede a /setup
    ↓
2. Hook useSystemSetup ejecuta verificaciones
    ↓
3. Si HAY errores críticos → BLOQUEO TOTAL
    ↓
4. Si NO hay errores → Permitir avanzar paso a paso
    ↓
5. Cada paso verifica sus dependencias antes de activarse
```

## 📋 Flujo del Setup Wizard

### **Fase 1: Bienvenida**
- **Componente**: `WelcomeScreen.tsx`
- **Función**: Introducción al sistema y recolección de nombre de usuario
- **Características**: 
  - Pantalla de bienvenida personalizada
  - Introducción a las características del sistema
  - Recolección de nombre para personalización

### **Fase 2: Infraestructura - Conexión Supabase**
- **Componente**: `SupabaseConnectionStep.tsx`
- **Función**: Interface para ingresar credenciales de Supabase
- **Características**: 
  - Validación de URL del proyecto
  - Validación de Anon Key
  - Instrucciones claras
  - Manejo de errores de conexión

### **Fase 3: Configuración de Base de Datos**
- **Componente**: `DatabaseSetupStep.tsx`
- **Función**: Ejecuta y muestra progreso de configuración de DB
- **Pasos**: 8 pasos visuales con feedback en tiempo real

#### 📊 Pasos de Configuración Automática

1. **🔗 Verificar conexión** - Validar credenciales Supabase
2. **👥 Sistema de roles** - Crear tipos y tablas de usuarios
3. **📦 Tablas principales** - Materiales, inventario, recetas
4. **💰 Sistema de ventas** - Ventas, clientes, proveedores
5. **⚙️ Funciones SQL** - Lógica de negocio automatizada
6. **🛡️ Políticas de seguridad** - Row Level Security
7. **🔄 Triggers automáticos** - Actualizaciones en tiempo real
8. **📝 Datos iniciales** - Configuración básica del sistema

### **Fase 4: Verificación del Sistema**
- **Componente**: `SystemVerification.tsx`
- **Función**: Verifica que todos los componentes estén funcionando correctamente
- **Verificaciones**: Conexión, tablas, roles, políticas RLS

### **Fase 5: Creación de Usuario Administrador**
- **Componente**: `AdminUserCreationStep.tsx`
- **Función**: Creación del primer usuario administrador del sistema
- **Características**: 
  - Validación de contraseña
  - Configuración de perfil
  - Asignación automática de rol SUPER_ADMIN

### **Fase 6: Definición del Modelo de Negocio**
- **Componente**: `BusinessModelStep.tsx` (v2.0)
- **Función**: Configuración interactiva del modelo de negocio
- **Características**: 
  - Layout de dos columnas
  - Panel de inteligencia de negocio
  - Sistema de clasificación automática
  - Cards expandibles mejoradas

### **Fase 7: Configuración Básica del Sistema** (Opcional)
- **Componente**: `BasicSystemConfig.tsx`
- **Función**: Configuraciones avanzadas del sistema
- **Características**:
  - Configuración de moneda
  - Preferencias regionales
  - Configuraciones de sistema avanzadas

### **Fase 8: Resumen y Finalización**
- **Componente**: `SetupSummary.tsx` + `FinishStep.tsx`
- **Función**: Confirmación y activación del sistema
- **Resultado**: Sistema completamente configurado y listo para usar

## 🎨 Mejoras Visuales v2.0

### Panel Izquierdo (Configuración Interactiva)
- ✅ **Cards expandibles mejoradas** - Layout horizontal compacto
- ✅ **Sistema de iconos consistente** - Lucide React
- ✅ **Jerarquía visual clara** - Header, secciones, subcategorías
- ✅ **Responsive design** - Adaptación a móviles y tablets

### Panel Derecho (Inteligencia de Negocio)
- ✅ **Clasificación automática** - 7 tiers de complejidad
- ✅ **Score de complejidad** - Cálculo dinámico 1-10
- ✅ **Resumen inteligente** - Lista automática de capacidades
- ✅ **Insights de negocio** - Recomendaciones contextuales
- ✅ **Animaciones profesionales** - Framer Motion

### Sistema de Clasificación de Negocio

#### Tiers Disponibles
1. **Sin Configurar** - Estado inicial
2. **Base Operativa** - Una actividad principal (🌱)
3. **Estructura Funcional** - Múltiples canales (🏗️)
4. **Negocio Integrado** - Varias líneas de negocio (🏢)
5. **Negocio Digital** - Enfoque online/digital (💻)
6. **Centro de Experiencias** - Eventos y experiencias (🎭)
7. **Sistema Consolidado** - Máxima complejidad (🏭)

#### Métricas Calculadas
- **Complejidad Score**: 1-10 basado en capacidades seleccionadas
- **Resumen de Negocio**: Lista automática de actividades
- **Insights**: Recomendaciones basadas en configuración

## 🔧 Implementación Técnica

### Servicios Backend

```typescript
// DatabaseSetupService.ts - Motor de configuración
export class DatabaseSetupService {
  // Ejecuta todas las consultas SQL necesarias
  // Progreso granular, manejo de errores, SQL completo
  
  async runFullSetup(credentials: SupabaseCredentials): Promise<SetupResult> {
    // 1. Verificar conexión
    // 2. Crear tipos y enums
    // 3. Crear tablas principales
    // 4. Configurar políticas RLS
    // 5. Crear funciones SQL
    // 6. Insertar datos iniciales
    // 7. Configurar triggers
    // 8. Validar setup completo
  }
}
```

### Hooks de Estado

```typescript
// useSystemSetup.ts - Gestión de estado del setup
export function useSystemSetup() {
  const [canProceed, setCanProceed] = useState(false);
  const [criticalErrors, setCriticalErrors] = useState<string[]>([]);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>('pending');
  
  const checkSetupStatus = async () => {
    // Verificaciones críticas
    // Actualización de estado
    // Manejo de errores
  };
  
  return {
    canProceed,
    criticalErrors,
    setupStatus,
    checkSetupStatus,
    runDatabaseSetup,
    markStepCompleted
  };
}
```

### Adaptaciones de Theming

```typescript
// ANTES: useColorModeValue (problemas de compatibilidad)
const bgColor = useColorModeValue('gray.50', 'gray.900')

// AHORA: Tokens estáticos compatibles con G-Admin
bg="gray.100" // Se adapta automáticamente al tema
```

### Sistema de Iconos

```typescript
// Completamente migrado a Lucide React
import {
  Check, ChevronDown, ChevronUp, Info, TrendingUp, 
  Zap, BarChart3, Package, Clock, Calendar, RotateCw,
  ShoppingCart, Building, Home, Store, Truck
} from 'lucide-react'
```

## 🚀 Cómo Usar el Sistema

### Para Usuarios Finales:

1. **Navegar** a `http://localhost:5173/setup`
2. **Ingresar URL** del proyecto Supabase
3. **Ingresar Anon Key** de Supabase
4. **Hacer clic** en "Configurar Base de Datos Automáticamente"
5. **Esperar** a que todos los pasos se completen
6. **Configurar** modelo de negocio en paso interactivo
7. **¡Listo!** El sistema está configurado

### Para Desarrolladores:

```typescript
// Uso del BusinessSetupWizard completo
import { BusinessSetupWizard } from './components/BusinessSetupWizard'

export function SetupPage() {
  const handleComplete = (data: any) => {
    console.log('Setup completed:', data)
  }

  const handleStepChange = (step: number) => {
    console.log('Step changed to:', step)
  }

  return (
    <BusinessSetupWizard 
      currentStep={3}           // Paso actual (0-indexed)
      businessData={{           // Datos del negocio
        name: 'Mi Negocio',
        industry: 'Servicios'
      }}
      onStepChange={handleStepChange}  // Callback cambio de paso
      onComplete={handleComplete}      // Callback completado
    />
  )
}
```

```typescript
// Uso solo del step de modelo de negocio
import { BusinessModelDefinitionStepNew } from './components/BusinessModelDefinitionStepNew'

export function BusinessModelPage() {
  const handleComplete = (data: any) => {
    console.log('Business model defined:', data)
    // data incluye:
    // - capabilities: BusinessCapabilitiesNew
    // - business_structure: BusinessStructure
    // - operationalTier: string
  }

  const handleBack = () => {
    console.log('Going back')
  }

  return (
    <BusinessModelDefinitionStepNew 
      onComplete={handleComplete}
      onBack={handleBack}
    />
  )
}
```

## 🎯 Estados del Sistema

### **CUANDO HAY ERRORES CRÍTICOS:**

| Estado | Descripción | UI Mostrada |
|--------|-------------|-------------|
| `canProceed: false` | Errores críticos detectados | 🚫 **BLOQUEO CRÍTICO** - Botones rojos |
| `canProceed: true` | Sin errores, puede continuar | ✅ **PUEDE PROCEDER** - Botones activos |
| `criticalErrors.length > 0` | Lista de errores específicos | ⚠️ **LISTA DE ERRORES** - Con botones de ayuda |

### **VISUAL FEEDBACK IMPLEMENTADO**

```typescript
🔴 Errores Críticos → Fondo rojo, iconos de advertencia
🟡 Bloqueos Parciales → Fondo amarillo, iconos de espera  
🟢 Estado Correcto → Fondo verde, iconos de éxito
```

### **PASOS PARA RESOLVER ERRORES:**

1. **Identificar** los errores críticos mostrados en rojo
2. **Usar** el botón "📖 Guía de Configuración" para ver instrucciones
3. **Ejecutar** el script SQL proporcionado en Supabase
4. **Hacer clic** en "🔄 Verificar de Nuevo" 
5. **Continuar** cuando todos los requisitos estén en verde

## 📱 Características Responsive

### Breakpoints
- **Mobile** (`base`): Cards en columna única, sidebar oculto
- **Tablet** (`md`): Layout de 2 columnas, sidebar compacto
- **Desktop** (`lg`): Layout completo con sidebar expandido

### Adaptaciones Móviles
- Progreso en header se oculta, aparece barra de progreso superior
- Sidebar se convierte en íconos compactos
- Layout cambia a columna única en pantallas pequeñas

## ⚡ Performance y Optimizaciones

### Optimizaciones Incluidas
- **Lazy loading** de animaciones con AnimatePresence
- **Estado local optimizado** con useState
- **Re-renders mínimos** con callbacks memoizados
- **Responsive detection** con useEffect + resize listener
- **SQL optimizado** con transacciones y validaciones

### Manejo de Errores
- **Rollback automático** en caso de errores críticos
- **Logging detallado** de cada paso de configuración
- **Validación** antes y después de cada operación
- **Feedback específico** por tipo de error

## 🔒 Seguridad

### Validación del Sistema
```typescript
// Middleware de validación en el backend
export function validateSetupStep(step: string) {
  // Verificar permisos
  // Validar dependencias
  // Confirmar estado de la base de datos
  // Autorizar siguiente paso
}
```

### Principios de Seguridad
- **Validación de credenciales** antes de cualquier operación
- **Verificación de permisos** en cada paso
- **Transacciones atomicas** para evitar estados inconsistentes
- **Logging de auditoría** de todas las operaciones críticas

## 🔗 Archivos de Referencia

### Componentes Principales
- `src/pages/setup/SetupWizard.tsx` - Orquestador principal
- `src/pages/setup/components/SupabaseConnectionSetup.tsx` - Entrada de credenciales
- `src/pages/setup/components/DatabaseAutoSetup.tsx` - Configuración automática
- `src/pages/setup/components/BusinessModelDefinitionStep.tsx` - Modelo de negocio
- `src/services/DatabaseSetupService.ts` - Motor de configuración

### Servicios y Hooks
- `src/hooks/useSystemSetup.ts` - Lógica de verificación
- `src/lib/supabase.ts` - Cliente de Supabase
- `src/services/*` - Servicios de negocio

### Scripts y Configuración
- `database/complete_setup.sql` - Script de configuración completa
- `database/functions/*` - Funciones SQL de negocio
- `database/migrations/*` - Migraciones de base de datos

### Documentación
- `docs/DATABASE_SETUP_GUIDE.md` - Guía completa de configuración
- `docs/03-setup-deployment/database-setup.md` - Setup de base de datos
- `docs/04-user-guides/user-roles.md` - Sistema de roles y permisos

## 🧪 Testing y Desarrollo

### Componentes de Desarrollo
```typescript
// Para desarrollo y debugging
import { DeveloperControls } from './dev/DeveloperControls'

// Controles de desarrollo para testing del wizard
// Ubicado en: src/pages/setup/dev/DeveloperControls.tsx
```

### Verificaciones de Desarrollo
- [x] ✅ **Compilación TypeScript**: Sin errores
- [x] ✅ **Integración con SetupWizard**: Funcionando
- [x] ✅ **Compatibilidad Chakra UI v3**: Adaptado completamente
- [x] ✅ **Sistema de theming G-Admin**: Tokens dinámicos
- [x] ✅ **Iconos Lucide React**: Migración completa
- [x] ✅ **Responsive design**: Probado en múltiples breakpoints
- [x] ✅ **Animaciones**: Framer Motion funcionando
- [x] ✅ **Props compatibility**: Interfaces mantenidas

## 🚀 Beneficios del Sistema

### **Para Desarrolladores:**
- ✅ **Cero configuraciones rotas** en producción
- ✅ **Debugging claro** de problemas de BD
- ✅ **Instalación consistente** entre entornos
- ✅ **Menos soporte técnico** requerido
- ✅ **Componentes reutilizables** y modulares

### **Para Usuarios:**
- ✅ **Configuración guiada** paso a paso
- ✅ **Errores explicativos** en lugar de crashes
- ✅ **Instrucciones claras** para resolver problemas
- ✅ **Sistema confiable** desde el primer día
- ✅ **Experiencia moderna** y profesional

### **Para el Negocio:**
- ✅ **Datos seguros** con RLS configurado
- ✅ **Usuarios con roles** apropiados desde inicio
- ✅ **Base de datos consistente** en todas las instalaciones
- ✅ **Menos problemas** en implementaciones
- ✅ **Tiempo de configuración reducido**

## 📞 Soporte y Troubleshooting

### Para Resolver Problemas:
1. **Consultar** los logs del navegador (F12 → Console)
2. **Revisar** la documentación en `/docs/`
3. **Ejecutar** el script SQL en Supabase
4. **Verificar** variables de entorno (.env.local)
5. **Usar** el componente de prueba para debugging

### Logs Importantes:
- Setup progress en consola del navegador
- Errores de Supabase en Network tab
- Estado del hook useSystemSetup
- Resultados de cada paso de configuración

## 🎉 Resumen Ejecutivo

**El Setup Wizard v2.0 está COMPLETAMENTE IMPLEMENTADO y FUNCIONANDO.**

### ✅ **Características Principales**:
- **Sistema de bloqueo** que protege contra configuraciones incorrectas
- **Auto-configuración** completa de base de datos sin conocimientos técnicos
- **Experiencia visual moderna** con diseño responsive y animaciones
- **Clasificación inteligente** del modelo de negocio
- **Manejo robusto de errores** con feedback específico y guías de solución

### ✅ **Estado del Sistema**:
- **Completamente funcional** - Listo para producción
- **Totalmente documentado** - Guías completas disponibles
- **Probado y validado** - Sin errores de compilación
- **Optimizado** - Performance y UX mejorados

### 🚀 **Recomendación**:
✅ **SISTEMA LISTO PARA USO INMEDIATO** - Proporciona una experiencia de configuración profesional y confiable para todas las instalaciones de G-Admin Mini.

---

*🧙‍♂️ Setup Wizard v2.0 - Configuración inteligente para G-Admin Mini*
