# Sistema de Roles G-Mini - Con Rol CLIENTE

## Overview
Sistema de control de acceso basado en **5 roles** diseñado para el sistema de gestión restaurantera G-Mini, incluyendo roles para clientes que compran productos.

## Estructura de Roles

### 1. CLIENTE ⭐ NUEVO
**Rol para usuarios finales que compran productos**
- ✅ **Customer Portal**: Portal personal con estadísticas de pedidos
- ✅ **Customer Menu**: Ver menú y productos disponibles
- ✅ **My Orders**: Crear pedidos y ver historial completo
- ✅ **Products**: Solo lectura para navegación y selección
- ✅ **Settings**: Configuración básica de perfil personal
- ❌ **Operations**: Sin acceso a operaciones internas
- ❌ **Sales**: Sin acceso directo (solo a través del portal)
- ❌ **Materials**: Sin acceso al inventario
- ❌ **Staff**: Sin acceso a gestión de personal
- ❌ **Scheduling**: Sin acceso a horarios
- ❌ **Fiscal**: Sin acceso fiscal

### 2. OPERADOR
**Acceso más básico - Personal de cocina y servicio**
- ✅ **Operations**: Ver/editar órdenes, actualizar estados de cocina
- ✅ **Sales**: Crear/modificar ventas, gestión de mesas básica
- ❌ **Materials**: Solo lectura (inventario)
- ❌ **Products**: Solo lectura
- ❌ **Staff**: Sin acceso
- ❌ **Scheduling**: Ver solo su propio horario
- ❌ **Fiscal**: Sin acceso
- ❌ **Settings**: Sin acceso

### 3. SUPERVISOR
**Gestión operativa diaria - Supervisores de turno**
- ✅ **Operaciones**: Control total de cocina y servicio
- ✅ **Sales**: Gestión completa de ventas y reportes diarios
- ✅ **Materials**: Gestión básica de inventario, alertas de stock
- ✅ **Products**: Crear/editar productos, gestión de menú
- ✅ **Staff**: Ver performance del equipo, gestión básica
- ✅ **Scheduling**: Gestión de horarios del equipo
- ❌ **Fiscal**: Solo lectura de reportes
- ❌ **Settings**: Configuraciones básicas

### 4. ADMINISTRADOR
**Gestión completa del negocio - Gerentes**
- ✅ **Operaciones**: Control total + analytics avanzados
- ✅ **Sales**: Analytics completos, configuración de ventas
- ✅ **Materials**: Gestión completa de inventario + proveedores
- ✅ **Products**: Gestión completa + análisis de costos
- ✅ **Staff**: Gestión completa de personal + reportes
- ✅ **Scheduling**: Gestión completa de horarios + analytics
- ✅ **Fiscal**: Gestión fiscal completa
- ✅ **Settings**: Configuraciones del negocio

### 5. SUPER_ADMIN
**Control total del sistema - Propietarios/Desarrollo**
- ✅ **Todas las funciones de ADMINISTRADOR**
- ✅ **Settings**: Configuraciones del sistema, base de datos
- ✅ **User Management**: Crear/editar usuarios y roles
- ✅ **System Analytics**: Métricas del sistema completo
- ✅ **Backup/Restore**: Gestión de respaldos
- ✅ **Security**: Configuraciones de seguridad

## Flujo de Usuario Típico

### Para Clientes (CLIENTE)
1. **Registro**: Se registra y automáticamente recibe rol CLIENTE
2. **Login**: Accede a su portal personal
3. **Navegación**: Ve menú, productos y realiza pedidos
4. **Seguimiento**: Monitorea estado de sus pedidos
5. **Historial**: Revisa pedidos anteriores y estadísticas

### Para Staff (OPERADOR+)
1. **Login**: Accede con credenciales de empleado
2. **Dashboard**: Ve métricas operativas según su rol
3. **Operaciones**: Gestiona órdenes, inventario, etc.
4. **Reportes**: Accede a reportes según permisos

## Implementación Técnica

### Base de Datos - SQL Actualizado
```sql
-- Create user role enum (CLIENTE agregado)
CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');

-- Create users_roles table
CREATE TABLE auth.users_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLIENTE', -- Por defecto nuevos usuarios son CLIENTES
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) WHERE is_active = TRUE
);
```

### Jerarquía de Roles
```typescript
const roleHierarchy = {
  CLIENTE: -1,        // Nivel más bajo (usuarios finales)
  OPERADOR: 0,        // Staff básico
  SUPERVISOR: 1,      // Gestión intermedia
  ADMINISTRADOR: 2,   // Gestión alta
  SUPER_ADMIN: 3      // Control total
};
```

### Módulos por Rol

#### Módulos para CLIENTE
- **customer_portal**: `/customer-portal` - Portal personal
- **customer_menu**: `/menu` - Menú de productos
- **my_orders**: `/my-orders` - Historial de pedidos

#### Módulos Compartidos
- **dashboard**: Adaptativo según rol
- **products**: Lectura para CLIENTE, gestión para SUPERVISOR+
- **settings**: Básico para CLIENTE, avanzado para ADMIN+

### Funciones de Acceso Específicas

```typescript
// Para clientes
const { 
  isCliente,
  canPlaceOrders,
  canViewOwnOrders,
  canAccessCustomerPortal 
} = useRoleAccess();

// Para staff
const {
  isOperador,
  isSupervisor,
  isAdministrador,
  isSuperAdmin,
  canManageInventory,
  canManageStaff
} = useRoleAccess();
```

## Experiencia de Usuario

### Portal del Cliente
- **Dashboard personalizado** con estadísticas de pedidos
- **Navegación simplificada** solo a módulos relevantes
- **Historial completo** de pedidos y favoritos
- **Seguimiento en tiempo real** del estado de pedidos

### Diferenciación Visual
- **Colores**: Clientes usan paleta azul/verde, staff usa paleta completa
- **Navegación**: Sidebar adaptativa que solo muestra módulos accesibles
- **Contenido**: Dashboards específicos por rol

## Casos de Uso

### Restaurante con QR
1. **Cliente escanea QR** → Se registra automáticamente como CLIENTE
2. **Ve menú digital** → Navega productos disponibles
3. **Realiza pedido** → Crea orden desde customer_portal
4. **Hace seguimiento** → Ve estado en tiempo real

### Delivery/Takeout
1. **Cliente se registra** → Rol CLIENTE por defecto
2. **Explora menú** → Ve productos y precios
3. **Configura entrega** → Gestiona direcciones en settings
4. **Realiza pedidos** → Sistema completo de ordering

### Staff Operations
1. **Personal ingresa** → Roles OPERADOR+ según posición
2. **Ve dashboard apropiado** → Métricas según responsabilidades
3. **Gestiona operaciones** → Acceso a módulos según permisos
4. **Reportes y analytics** → Datos según nivel de autorización

## Migración y Configuración

### Primera Configuración
1. Ejecutar migración SQL para crear tabla con rol CLIENTE
2. Nuevos registros automáticamente son CLIENTE
3. Promover manualmente primer usuario a SUPER_ADMIN
4. Configurar staff con roles apropiados

### Usuarios Existentes
- Los usuarios existentes sin rol asignado reciben CLIENTE por defecto
- Se pueden promover manualmente según necesidad
- Sistema mantiene compatibilidad con roles anteriores

## Beneficios del Sistema

### Para el Negocio
- **Separación clara** entre clientes y personal
- **Seguridad mejorada** con acceso granular
- **Escalabilidad** para diferentes tipos de usuarios
- **Analytics diferenciados** por tipo de usuario

### Para los Clientes
- **Experiencia personalizada** sin complejidad innecesaria
- **Portal dedicado** con sus datos y pedidos
- **Navegación intuitiva** sin opciones administrativas
- **Seguimiento completo** de actividad

### Para el Personal
- **Acceso apropiado** según responsabilidades
- **Dashboard relevante** sin información innecesaria
- **Flujo optimizado** para tareas específicas
- **Jerarquía clara** de permisos

---
**Sistema actualizado para incluir rol CLIENTE - G-Mini v4.0**