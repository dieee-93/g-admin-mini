# 🧙‍♂️ Wizard de Setup del Sistema - Guía Completa

> **Última actualización**: 2025-09-08  
> **Autor**: Documento fusionado  
> **Estado**: Sistema implementado y funcionando

## 🎯 Resumen

El Setup Wizard v2.0 de G-Admin Mini proporciona una experiencia guiada para la configuración inicial del sistema, desde la verificación de infraestructura hasta la configuración completa del negocio.

## ✅ Estado de Implementación: COMPLETADO

El sistema de setup ha sido completamente implementado con:
- ✅ **Sistema de verificación por capas**
- ✅ **Wizard interactivo mejorado**
- ✅ **Inteligencia de negocio integrada**
- ✅ **Sistema de bloqueo de seguridad**

## 🛡️ Sistema de Verificación y Bloqueo

### Verificación por Capas

| Capa | Tipo de Bloqueo | Requisitos | Impacto |
|------|----------------|------------|---------|
| **CRÍTICA** | 🚫 **BLOQUEO TOTAL** | Conexión, Tablas, RLS, Funciones SQL, Roles | App completamente bloqueada |
| **CONFIGURACIÓN** | ⚠️ **BLOQUEO PARCIAL** | Admin User, System Config | Funcionalidades limitadas |
| **OPCIONAL** | 💡 **ADVERTENCIAS** | Hooks JWT, Datos Ejemplo | Solo notificaciones |

### Verificaciones Críticas Implementadas

```typescript
✅ Conexión a Supabase - Verificación profunda de conectividad
✅ Tablas Esenciales - 8 tablas críticas verificadas
✅ Sistema de Roles - users_roles + funciones de acceso
✅ Políticas RLS - Row Level Security funcionando
✅ Funciones SQL - get_user_role, check_user_access
✅ Usuario Admin - Verificación de SUPER_ADMIN activo
✅ Configuración Sistema - system_config accesible
```

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
src/pages/setup/
├── components/
│   ├── BusinessModelDefinitionStep.tsx    ✅ ACTUALIZADO (nuevo diseño)
│   ├── BusinessSetupWizard.tsx           ✅ NUEVO (para uso futuro)
│   └── [otros componentes de setup]
├── backup/                               ✅ ORGANIZADO
│   ├── BusinessModelDefinitionStep.backup.tsx  
│   ├── TestNewComponents.tsx
│   └── WelcomeScreen.new.tsx
├── SetupWizard.tsx                       ✅ INTEGRADO (usa nuevo componente)
└── [otros archivos del wizard]
```

### Flujo de Verificación

```
1. Usuario accede a /setup
    ↓
2. Hook useSystemSetup ejecuta verificaciones
    ↓
3. Si HAY errores críticos → BLOQUEO TOTAL
    ↓
4. Si hay configuración pendiente → BLOQUEO PARCIAL
    ↓
5. Si todo OK → Acceso completo al wizard
```

## 🎨 Características del Wizard v2.0

### Panel Izquierdo - Configuración Interactiva

#### ✅ Cards Expandibles Mejoradas
- Layout horizontal compacto
- Sistema de iconos consistente (Lucide React)
- Jerarquía visual clara (Header, secciones, subcategorías)
- Responsive design para móviles y tablets

#### ✅ Navegación Inteligente
- Botones deshabilitados si hay errores críticos
- Mensajes de bloqueo explicativos
- Verificación de dependencias entre pasos
- Progreso bloqueado hasta resolver problemas

### Panel Derecho - Inteligencia de Negocio

#### ✅ Clasificación Automática
- **7 tiers de complejidad** de negocio
- **Score dinámico 1-10** calculado en tiempo real
- **Resumen automático** de capacidades seleccionadas
- **Insights contextuales** según configuración

#### ✅ Características Avanzadas
- Animaciones profesionales (Framer Motion)
- Cálculo inteligente de complejidad
- Recomendaciones automáticas
- Preview de configuración en tiempo real

## 📋 Flujo del Setup Wizard

### Fase 1: Verificación de Sistema
1. **Conectividad Supabase**
   - Verificación de URL y keys
   - Test de conexión en tiempo real
   - Validación de permisos básicos

2. **Infraestructura de Base de Datos**
   - Verificación de tablas críticas
   - Validación de funciones RPC
   - Check de políticas RLS

3. **Sistema de Autenticación**
   - Verificación de auth provider
   - Validación de roles básicos
   - Test de sistema de permisos

### Fase 2: Configuración Administrativa
1. **Creación de Super Admin**
   ```typescript
   // Verificación y creación automática
   const adminUser = await createSuperAdmin({
     email: adminEmail,
     password: securePassword,
     profile: adminProfile
   });
   ```

2. **Configuración del Sistema**
   ```typescript
   // Configuración básica del sistema
   const systemConfig = {
     businessName: string,
     currency: 'ARS' | 'USD' | 'EUR',
     timezone: string,
     locale: string
   };
   ```

### Fase 3: Definición del Modelo de Negocio
```typescript
// Configuración inteligente por tipo de negocio
const businessModel = {
  type: 'restaurant' | 'cafe' | 'bakery' | 'catering',
  size: 'small' | 'medium' | 'large' | 'enterprise',
  features: BusinessFeature[],
  complexity: ComplexityScore
};
```

### Fase 4: Configuración Inicial de Datos
1. **Catálogo de Materiales**
   - Importación desde templates
   - Creación manual guiada
   - Configuración de categorías

2. **Proveedores Básicos**
   - Setup de proveedores principales
   - Configuración de contactos
   - Términos de pago

3. **Productos y Recetas**
   - Creación de productos base
   - Setup de recetas básicas
   - Configuración de precios

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# System Configuration
VITE_SYSTEM_NAME="G-Admin Mini"
VITE_DEFAULT_LOCALE="es-AR"
VITE_DEFAULT_CURRENCY="ARS"
```

### Dependencias Críticas
```json
{
  "@supabase/supabase-js": "^2.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@chakra-ui/react": "^2.x",
  "framer-motion": "^6.x"
}
```

## 🎯 Componentes Principales

### BusinessModelDefinitionStep.tsx
```typescript
// Componente principal mejorado
interface BusinessModelDefinitionStepProps {
  onNext: (data: BusinessModelData) => void;
  onBack?: () => void;
  initialData?: Partial<BusinessModelData>;
}

// Características:
// - Layout de 2 columnas responsivo
// - Panel de inteligencia en tiempo real
// - Validación automática de configuración
// - Integración con sistema de scoring
```

### SystemVerificationStep.tsx
```typescript
// Verificación automática del sistema
interface SystemVerificationResult {
  database: VerificationStatus;
  authentication: VerificationStatus;
  permissions: VerificationStatus;
  functions: VerificationStatus;
}

// Estados:
// - 'pending' | 'success' | 'error' | 'warning'
// - Reportes detallados de errores
// - Sugerencias de corrección automática
```

## 🚨 Manejo de Errores y Bloqueos

### Errores Críticos (Bloqueo Total)
```typescript
// Condiciones que bloquean completamente el acceso
const criticalErrors = [
  'DATABASE_CONNECTION_FAILED',
  'MISSING_CRITICAL_TABLES',
  'RLS_POLICIES_NOT_FOUND',
  'AUTH_PROVIDER_ERROR'
];
```

### Errores de Configuración (Bloqueo Parcial)
```typescript
// Condiciones que limitan funcionalidades
const configurationErrors = [
  'ADMIN_USER_NOT_FOUND',
  'SYSTEM_CONFIG_INCOMPLETE',
  'BUSINESS_MODEL_NOT_DEFINED'
];
```

### Sistema de Recuperación
```typescript
// Opciones de recuperación automática
const recoveryOptions = {
  autoCreateTables: boolean,
  autoSetupRLS: boolean,
  autoCreateAdmin: boolean,
  useDefaultConfig: boolean
};
```

## 📊 Inteligencia de Negocio

### Sistema de Scoring
```typescript
// Cálculo automático de complejidad
interface ComplexityScore {
  total: number; // 1-10
  factors: {
    businessType: number;
    numberOfLocations: number;
    staffSize: number;
    menuComplexity: number;
    integrations: number;
  };
}
```

### Clasificación por Tiers
```typescript
const businessTiers = {
  'Tier 1 - Básico': { score: 1-2, description: 'Negocio simple, pocas funcionalidades' },
  'Tier 2 - Estándar': { score: 3-4, description: 'Negocio típico, funcionalidades core' },
  'Tier 3 - Avanzado': { score: 5-6, description: 'Múltiples ubicaciones, staff complejo' },
  'Tier 4 - Enterprise': { score: 7-8, description: 'Operaciones complejas, integraciones' },
  'Tier 5 - Corporativo': { score: 9-10, description: 'Máxima complejidad, custom features' }
};
```

## 🔄 Hooks Principales

### useSystemSetup
```typescript
// Hook principal para manejo del setup
const {
  isVerifying,
  verificationResults,
  criticalErrors,
  canProceed,
  runVerification,
  resetVerification
} = useSystemSetup();
```

### useBusinessModel
```typescript
// Hook para configuración del modelo de negocio
const {
  businessData,
  complexityScore,
  updateBusinessData,
  calculateComplexity,
  generateRecommendations
} = useBusinessModel();
```

## 🚀 Próximas Mejoras

### Características Planificadas
- [ ] **Setup automático desde templates** de industria
- [ ] **Importación masiva** de datos desde Excel/CSV
- [ ] **Wizards especializados** por tipo de negocio
- [ ] **Configuración avanzada** de integraciones
- [ ] **Dashboard de salud** del sistema post-setup

### Optimizaciones Técnicas
- [ ] **Caché inteligente** de verificaciones
- [ ] **Verificación asíncrona** en background
- [ ] **Rollback automático** de configuraciones fallidas
- [ ] **Backup automático** antes de cambios críticos

## 🔗 Referencias

- **[Database Setup Guide](database-setup.md)** - Configuración de base de datos
- **[User Roles Guide](../04-user-guides/user-roles.md)** - Sistema de permisos
- **[Business Setup Guide](../04-user-guides/business-setup.md)** - Configuración de negocio
- **[JWT Authentication](../07-technical-reference/jwt-authentication.md)** - Sistema de autenticación

## 📝 Notas de Migración

### Cambios desde v1.0
- ✅ Sistema de bloqueo implementado
- ✅ Inteligencia de negocio integrada
- ✅ Layout mejorado con 2 columnas
- ✅ Verificación automática de dependencias
- ✅ Scoring dinámico de complejidad

### Breaking Changes
- El wizard anterior requiere migración de estado
- Nuevos campos obligatorios en configuración
- API actualizada para verificaciones de sistema

### Compatibilidad
- ✅ Retrocompatible con configuraciones existentes
- ✅ Migración automática de datos legacy
- ✅ Fallback a configuración manual si falla automática
