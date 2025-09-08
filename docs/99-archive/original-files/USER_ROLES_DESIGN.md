# Sistema de Roles de Usuario - G-Mini

## Overview
Sistema de control de acceso basado en 4 roles diseñado para el sistema de gestión restaurantera G-Mini.

## Estructura de Roles

### 1. OPERADOR
**Acceso más básico - Personal de cocina y servicio**
- ✅ **Operaciones**: Ver/editar órdenes, actualizar estados de cocina
- ✅ **Sales**: Crear/modificar ventas, gestión de mesas básica
- ❌ **Materials**: Solo lectura (inventario)
- ❌ **Products**: Solo lectura
- ❌ **Staff**: Sin acceso
- ❌ **Scheduling**: Ver solo su propio horario
- ❌ **Fiscal**: Sin acceso
- ❌ **Settings**: Sin acceso

### 2. SUPERVISOR
**Gestión operativa diaria - Supervisores de turno**
- ✅ **Operaciones**: Control total de cocina y servicio
- ✅ **Sales**: Gestión completa de ventas y reportes diarios
- ✅ **Materials**: Gestión básica de inventario, alertas de stock
- ✅ **Products**: Crear/editar productos, gestión de menú
- ✅ **Staff**: Ver performance del equipo, gestión básica
- ✅ **Scheduling**: Gestión de horarios del equipo
- ❌ **Fiscal**: Solo lectura de reportes
- ❌ **Settings**: Configuraciones básicas

### 3. ADMINISTRADOR
**Gestión completa del negocio - Gerentes**
- ✅ **Operaciones**: Control total + analytics avanzados
- ✅ **Sales**: Analytics completos, configuración de ventas
- ✅ **Materials**: Gestión completa de inventario + proveedores
- ✅ **Products**: Gestión completa + análisis de costos
- ✅ **Staff**: Gestión completa de personal + reportes
- ✅ **Scheduling**: Gestión completa de horarios + analytics
- ✅ **Fiscal**: Gestión fiscal completa
- ✅ **Settings**: Configuraciones del negocio

### 4. SUPER ADMIN
**Control total del sistema - Propietarios/Desarrollo**
- ✅ **Todas las funciones de ADMINISTRADOR**
- ✅ **Settings**: Configuraciones del sistema, base de datos
- ✅ **User Management**: Crear/editar usuarios y roles
- ✅ **System Analytics**: Métricas del sistema completo
- ✅ **Backup/Restore**: Gestión de respaldos
- ✅ **Security**: Configuraciones de seguridad

## Implementación Técnica

### Base de Datos
```sql
-- Enum de roles
CREATE TYPE user_role AS ENUM ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');

-- Tabla de usuarios
CREATE TABLE auth.users_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'OPERADOR',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies por Módulo

#### Materials (Inventario)
```sql
-- OPERADOR: Solo lectura
CREATE POLICY "operador_materials_read" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN')
      AND ur.is_active = TRUE
    )
  );

-- SUPERVISOR+: CRUD completo
CREATE POLICY "supervisor_materials_write" ON materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN')
      AND ur.is_active = TRUE
    )
  );
```

#### Sales (Ventas)
```sql
-- OPERADOR+: Crear y modificar ventas
CREATE POLICY "operador_sales_access" ON sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN')
      AND ur.is_active = TRUE
    )
  );
```

#### Staff (Personal)
```sql
-- SUPERVISOR+: Gestión de personal
CREATE POLICY "supervisor_staff_access" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN')
      AND ur.is_active = TRUE
    )
  );

-- OPERADOR: Solo ver su propia información
CREATE POLICY "operador_own_staff_read" ON staff
  FOR SELECT USING (
    employee_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM auth.users_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'OPERADOR'
      AND ur.is_active = TRUE
    )
  );
```

### Frontend - Guards de Ruta

```typescript
// hooks/useRoleAccess.ts
export function useRoleAccess() {
  const { user } = useAuth();
  
  const hasRole = useCallback((requiredRoles: UserRole[]) => {
    if (!user?.role) return false;
    return requiredRoles.includes(user.role);
  }, [user?.role]);

  const canAccessModule = useCallback((module: ModuleName) => {
    const modulePermissions = {
      'materials': ['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
      'staff': ['SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
      'fiscal': ['ADMINISTRADOR', 'SUPER_ADMIN'],
      'settings': ['ADMINISTRADOR', 'SUPER_ADMIN'],
      'operations': ['OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
      'sales': ['OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
    };
    
    return hasRole(modulePermissions[module] || []);
  }, [hasRole]);

  return { hasRole, canAccessModule };
}
```

### Navegación Adaptativa

```typescript
// shared/navigation/Sidebar.tsx
export function Sidebar() {
  const { canAccessModule } = useRoleAccess();
  
  const modules = [
    { name: 'operations', icon: CogIcon, href: '/operations' },
    { name: 'sales', icon: CurrencyDollarIcon, href: '/sales' },
    { name: 'materials', icon: CubeIcon, href: '/materials', requiresRole: true },
    { name: 'staff', icon: UsersIcon, href: '/staff', requiresRole: true },
    { name: 'fiscal', icon: DocumentTextIcon, href: '/fiscal', requiresRole: true },
    { name: 'settings', icon: CogIcon, href: '/settings', requiresRole: true },
  ].filter(module => 
    !module.requiresRole || canAccessModule(module.name as ModuleName)
  );

  return (
    // Renderizar solo módulos accesibles
  );
}
```

## Funcionalidades por Rol

### Gestión de Usuarios (SUPER_ADMIN)
- Panel de administración de usuarios
- Asignación y cambio de roles
- Auditoria de accesos
- Suspensión/activación de cuentas

### Dashboard Adaptativo
- **OPERADOR**: Órdenes pendientes, estado de cocina
- **SUPERVISOR**: KPIs diarios, alertas de inventario
- **ADMINISTRADOR**: Analytics de negocio, reportes financieros
- **SUPER_ADMIN**: Métricas del sistema, usuarios activos

### Reportes por Rol
- **Operacional**: Estados de órdenes, tiempos de cocina
- **Supervisión**: Ventas diarias, performance del equipo
- **Administrativa**: P&L, análisis de costos, tendencias
- **Sistema**: Logs de acceso, performance, errores

## Implementación Gradual

### Fase 1: Base de Roles ✅
- [x] Autenticación básica
- [x] Estructura de base de datos
- [ ] Guards básicos de ruta

### Fase 2: Permisos por Módulo
- [ ] RLS policies por tabla
- [ ] Guards de componente
- [ ] Navegación adaptativa

### Fase 3: Gestión de Usuarios
- [ ] Panel de administración
- [ ] Asignación de roles
- [ ] Auditoria de accesos

### Fase 4: Analytics por Rol
- [ ] Dashboards adaptativos
- [ ] Reportes especializados
- [ ] Métricas de performance