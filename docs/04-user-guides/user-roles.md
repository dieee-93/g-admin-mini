# 👥 Sistema de Roles y Permisos - G-Admin Mini

> **Última actualización**: 2025-09-08  
> **Autor**: Consolidación de USER_ROLES_DESIGN.md + USER_ROLES_WITH_CUSTOMERS.md  
> **Estado**: Documento unificado

## 🎯 Visión General

Sistema de control de acceso basado en **5 roles** diseñado para el sistema de gestión restaurantera G-Admin Mini, proporcionando permisos granulares desde clientes hasta administradores del sistema.

## 🏗️ Estructura de Roles

### 1. 🛍️ **CLIENTE** ⭐ 
**Rol para usuarios finales que compran productos**

#### Permisos de Acceso:
- ✅ **Customer Portal**: Portal personal con estadísticas de pedidos
- ✅ **Customer Menu**: Ver menú y productos disponibles  
- ✅ **My Orders**: Crear pedidos y ver historial completo
- ✅ **Products**: Solo lectura para navegación y selección
- ✅ **Profile Settings**: Configuración básica de perfil personal
- ✅ **Payment Methods**: Gestión de métodos de pago personales
- ✅ **Loyalty Program**: Acceso a programas de fidelización

#### Restricciones:
- ❌ **Operations**: Sin acceso a operaciones internas
- ❌ **Sales Management**: Sin acceso directo (solo portal de cliente)
- ❌ **Materials**: Sin acceso al inventario
- ❌ **Staff**: Sin acceso a gestión de personal
- ❌ **Scheduling**: Sin acceso a horarios
- ❌ **Fiscal**: Sin acceso fiscal
- ❌ **System Admin**: Sin acceso administrativo

---

### 2. 👨‍🍳 **OPERADOR**
**Acceso más básico - Personal de cocina y servicio**

#### Permisos de Acceso:
- ✅ **Operations**: Ver/editar órdenes, actualizar estados de cocina
- ✅ **Sales Basic**: Crear/modificar ventas, gestión de mesas básica
- ✅ **Order Management**: Procesar y actualizar estado de pedidos
- ✅ **Kitchen Display**: Panel de cocina y preparación
- ✅ **Basic POS**: Funciones básicas de punto de venta
- ✅ **Customer Service**: Atención básica al cliente

#### Restricciones:
- ❌ **Materials**: Solo lectura (inventario básico)
- ❌ **Products**: Solo lectura (no puede modificar menú)
- ❌ **Staff**: Sin acceso a gestión de personal
- ❌ **Scheduling**: Ver solo su propio horario
- ❌ **Fiscal**: Sin acceso a reportes fiscales
- ❌ **Settings**: Sin acceso a configuraciones
- ❌ **Reports**: Sin acceso a reportes avanzados

---

### 3. 👩‍💼 **SUPERVISOR**
**Gestión operativa diaria - Supervisores de turno**

#### Permisos de Acceso:
- ✅ **Operations Full**: Control total de cocina y servicio
- ✅ **Sales Management**: Gestión completa de ventas y reportes diarios
- ✅ **Materials Basic**: Gestión básica de inventario, alertas de stock
- ✅ **Products Management**: Crear/editar productos, gestión de menú
- ✅ **Staff Basic**: Ver performance del equipo, gestión básica
- ✅ **Scheduling Team**: Gestión de horarios del equipo
- ✅ **Customer Management**: Gestión básica de clientes
- ✅ **Daily Reports**: Reportes operativos del día
- ✅ **POS Advanced**: Funciones avanzadas de punto de venta

#### Restricciones:
- ❌ **Fiscal Full**: Solo lectura de reportes fiscales
- ❌ **Settings Advanced**: Solo configuraciones básicas
- ❌ **Staff Hiring**: No puede contratar/despedir personal
- ❌ **System Config**: Sin acceso a configuraciones del sistema

---

### 4. 🏢 **ADMINISTRADOR**
**Gestión completa del negocio - Gerentes**

#### Permisos de Acceso:
- ✅ **Operations Analytics**: Control total + analytics avanzados
- ✅ **Sales Analytics**: Analytics completos, configuración de ventas
- ✅ **Materials Full**: Gestión completa de inventario + proveedores
- ✅ **Products Full**: Gestión completa + análisis de costos
- ✅ **Staff Full**: Gestión completa de personal + reportes
- ✅ **Scheduling Full**: Gestión completa de horarios + analytics
- ✅ **Fiscal Management**: Gestión fiscal completa
- ✅ **Business Settings**: Configuraciones del negocio
- ✅ **Customer Analytics**: Análisis completo de clientes
- ✅ **Financial Reports**: Reportes financieros avanzados
- ✅ **Supplier Management**: Gestión completa de proveedores

#### Restricciones:
- ❌ **System Admin**: Sin acceso a configuraciones del sistema
- ❌ **User Management**: Sin acceso a gestión de usuarios del sistema
- ❌ **Database Access**: Sin acceso directo a base de datos

---

### 5. 👑 **SUPER ADMIN**
**Control total del sistema - Propietarios/Desarrollo**

#### Permisos de Acceso:
- ✅ **All Administrator Functions**: Todas las funciones de ADMINISTRADOR
- ✅ **System Settings**: Configuraciones del sistema y base de datos
- ✅ **User Management**: Crear/editar usuarios y roles
- ✅ **System Analytics**: Métricas del sistema completo
- ✅ **Backup/Restore**: Gestión de respaldos
- ✅ **Security Config**: Configuraciones de seguridad
- ✅ **Database Management**: Acceso y gestión de base de datos
- ✅ **Feature Flags**: Control de características del sistema
- ✅ **API Management**: Gestión de APIs y endpoints
- ✅ **Audit Logs**: Acceso completo a logs de auditoría

#### Sin Restricciones:
- ✅ **Full System Access**: Acceso total al sistema

## 🔧 Implementación Técnica

### Database Schema

```sql
-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'operador',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enum de roles
CREATE TYPE user_role AS ENUM (
    'cliente',
    'operador', 
    'supervisor',
    'administrador',
    'super_admin'
);

-- Tabla de permisos específicos
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    module VARCHAR(50) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### TypeScript Types

```typescript
export type UserRole = 
  | 'cliente'
  | 'operador' 
  | 'supervisor'
  | 'administrador'
  | 'super_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile?: UserProfile;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  module: string;
  action: string;
  granted: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  preferences: UserPreferences;
}
```

### Permission System

```typescript
// Sistema de permisos basado en roles
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  cliente: [
    { module: 'customer-portal', action: 'read', granted: true },
    { module: 'customer-portal', action: 'write', granted: true },
    { module: 'products', action: 'read', granted: true },
    { module: 'orders', action: 'create', granted: true },
    { module: 'orders', action: 'read_own', granted: true },
    { module: 'profile', action: 'write', granted: true }
  ],
  
  operador: [
    { module: 'operations', action: 'read', granted: true },
    { module: 'operations', action: 'write', granted: true },
    { module: 'sales', action: 'read', granted: true },
    { module: 'sales', action: 'write', granted: true },
    { module: 'materials', action: 'read', granted: true },
    { module: 'products', action: 'read', granted: true },
    { module: 'scheduling', action: 'read_own', granted: true }
  ],
  
  supervisor: [
    // ... incluye todos los permisos de operador +
    { module: 'materials', action: 'write', granted: true },
    { module: 'products', action: 'write', granted: true },
    { module: 'staff', action: 'read', granted: true },
    { module: 'staff', action: 'write_basic', granted: true },
    { module: 'scheduling', action: 'write', granted: true },
    { module: 'reports', action: 'read_daily', granted: true }
  ],
  
  administrador: [
    // ... incluye todos los permisos de supervisor +
    { module: 'staff', action: 'write_full', granted: true },
    { module: 'fiscal', action: 'read', granted: true },
    { module: 'fiscal', action: 'write', granted: true },
    { module: 'settings', action: 'write_business', granted: true },
    { module: 'analytics', action: 'read', granted: true },
    { module: 'suppliers', action: 'write', granted: true }
  ],
  
  super_admin: [
    // ... incluye todos los permisos +
    { module: 'system', action: 'read', granted: true },
    { module: 'system', action: 'write', granted: true },
    { module: 'users', action: 'write', granted: true },
    { module: 'database', action: 'read', granted: true },
    { module: 'security', action: 'write', granted: true }
  ]
};
```

### Hooks de Autenticación

```typescript
// Hook principal de autenticación
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return rolePermissions.some(perm => 
      perm.module === module && 
      perm.action === action && 
      perm.granted
    );
  };
  
  const canAccess = (resource: string): boolean => {
    const [module, action = 'read'] = resource.split(':');
    return hasPermission(module, action);
  };
  
  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
  
  const isAtLeastRole = (role: UserRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy: UserRole[] = [
      'cliente', 'operador', 'supervisor', 'administrador', 'super_admin'
    ];
    
    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const requiredRoleIndex = roleHierarchy.indexOf(role);
    
    return userRoleIndex >= requiredRoleIndex;
  };
  
  return {
    user,
    loading,
    hasPermission,
    canAccess,
    isRole,
    isAtLeastRole,
    login,
    logout,
    updateProfile
  };
}
```

### Componentes de Protección

```typescript
// Componente para proteger rutas
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallback = <UnauthorizedPage />
}: ProtectedRouteProps) {
  const { user, isAtLeastRole, canAccess } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }
  
  if (requiredRole && !isAtLeastRole(requiredRole)) {
    return fallback;
  }
  
  if (requiredPermission && !canAccess(requiredPermission)) {
    return fallback;
  }
  
  return <>{children}</>;
}

// Componente para mostrar contenido condicionalmente
interface RoleGateProps {
  children: React.ReactNode;
  role?: UserRole;
  permission?: string;
  minRole?: UserRole;
}

export function RoleGate({ children, role, permission, minRole }: RoleGateProps) {
  const { isRole, canAccess, isAtLeastRole } = useAuth();
  
  if (role && !isRole(role)) return null;
  if (minRole && !isAtLeastRole(minRole)) return null;
  if (permission && !canAccess(permission)) return null;
  
  return <>{children}</>;
}
```

## 🎯 Casos de Uso por Rol

### 🛍️ Cliente - Experiencia de Compra
```typescript
function CustomerDashboard() {
  return (
    <div>
      <CustomerWelcome />
      <RecentOrders />
      <FavoriteProducts />
      <LoyaltyProgram />
      <OrderHistory />
    </div>
  );
}
```

### 👨‍🍳 Operador - Panel de Cocina
```typescript
function OperatorDashboard() {
  return (
    <ProtectedRoute requiredRole="operador">
      <div>
        <KitchenDisplay />
        <ActiveOrders />
        <RoleGate permission="sales:write">
          <BasicPOS />
        </RoleGate>
        <MySchedule />
      </div>
    </ProtectedRoute>
  );
}
```

### 👩‍💼 Supervisor - Panel de Gestión
```typescript
function SupervisorDashboard() {
  return (
    <ProtectedRoute requiredRole="supervisor">
      <div>
        <DailyOperations />
        <TeamPerformance />
        <RoleGate permission="materials:write">
          <InventoryAlerts />
        </RoleGate>
        <MenuManagement />
        <TeamScheduling />
      </div>
    </ProtectedRoute>
  );
}
```

### 🏢 Administrador - Panel Ejecutivo
```typescript
function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <div>
        <BusinessAnalytics />
        <FinancialReports />
        <RoleGate permission="staff:write_full">
          <StaffManagement />
        </RoleGate>
        <SupplierManagement />
        <BusinessSettings />
      </div>
    </ProtectedRoute>
  );
}
```

### 👑 Super Admin - Panel del Sistema
```typescript
function SuperAdminDashboard() {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <div>
        <SystemHealth />
        <UserManagement />
        <DatabaseManagement />
        <SecuritySettings />
        <FeatureFlags />
        <AuditLogs />
      </div>
    </ProtectedRoute>
  );
}
```

## 🔒 Seguridad y Mejores Prácticas

### Validación del Lado del Servidor
```typescript
// Middleware de validación de permisos en el backend
export function requirePermission(module: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // Usuario autenticado
    
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const hasPermission = await checkUserPermission(user.id, module, action);
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Sin permisos suficientes' });
    }
    
    next();
  };
}

// Uso en rutas
app.get('/api/admin/users', 
  requireAuth,
  requirePermission('users', 'read'),
  getUsersController
);
```

### Principio de Menor Privilegio
- Los usuarios reciben solo los permisos mínimos necesarios
- Los permisos se pueden escalar pero no degradar automáticamente
- Revisión regular de permisos asignados

### Auditoría de Acciones
```typescript
// Sistema de logging de acciones sensibles
export function logUserAction(userId: string, action: string, resource: string) {
  return db.insert('audit_logs', {
    user_id: userId,
    action,
    resource,
    timestamp: new Date(),
    ip_address: getClientIP(),
    user_agent: getUserAgent()
  });
}
```

## 📊 Matriz de Permisos Completa

| Módulo | Cliente | Operador | Supervisor | Admin | Super Admin |
|--------|---------|----------|------------|-------|-------------|
| **Customer Portal** | ✅ R/W | ❌ | ❌ | 👁️ R | 👁️ R |
| **Operations** | ❌ | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| **Sales Basic** | 🛒 Own | ✅ R/W | ✅ R/W | ✅ R/W | ✅ R/W |
| **Sales Analytics** | ❌ | ❌ | 👁️ Daily | ✅ Full | ✅ Full |
| **Materials** | ❌ | 👁️ R | ✅ Basic | ✅ Full | ✅ Full |
| **Products** | 👁️ R | 👁️ R | ✅ R/W | ✅ R/W | ✅ R/W |
| **Staff** | ❌ | ❌ | ✅ Basic | ✅ Full | ✅ Full |
| **Scheduling** | ❌ | 👁️ Own | ✅ Team | ✅ Full | ✅ Full |
| **Fiscal** | ❌ | ❌ | 👁️ R | ✅ R/W | ✅ R/W |
| **Settings** | 👤 Profile | ❌ | ⚙️ Basic | 🏢 Business | 🔧 System |
| **Users Management** | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **System Admin** | ❌ | ❌ | ❌ | ❌ | ✅ Full |

### Leyenda:
- ✅ **Full**: Acceso completo (lectura y escritura)
- 👁️ **R**: Solo lectura
- 🛒 **Own**: Solo sus propios datos
- ⚙️ **Basic**: Funcionalidades básicas
- 🏢 **Business**: Configuraciones de negocio
- 🔧 **System**: Configuraciones del sistema
- 👤 **Profile**: Solo perfil personal
- ❌ **No**: Sin acceso

## 🔗 Referencias

- **Authentication Service**: `src/lib/auth.ts`
- **Permission Definitions**: `src/types/permissions.ts`
- **Role Guards**: `src/components/auth/RoleGate.tsx`
- **Database Schema**: `database/migrations/001_user_roles.sql`
- **API Middleware**: `src/middleware/auth.ts`
