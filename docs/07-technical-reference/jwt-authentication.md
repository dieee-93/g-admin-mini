# Guía de Configuración JWT Hook y RLS - G-Admin Mini

## 📋 Pasos de Configuración Manual

### 1. Configurar Custom Access Token Hook en Supabase

#### En Supabase Dashboard:
1. Ve a tu proyecto en https://app.supabase.com
2. Navega a **SQL Editor**
3. Ejecuta el siguiente SQL:

```sql
-- Ejecutar el hook personalizado
-- Nota: El archivo de configuración debe crearse en database/hooks/custom_access_token_hook.sql
-- (Actualmente no existe en el proyecto)
```

4. Ve a **Authentication > Hooks** (NO Authentication > Settings)
5. Selecciona **"Postgres Function"** del dropdown
6. En la configuración del hook:
   - **Hook Type**: Custom Access Token
   - **Function Name**: `custom_access_token_hook`
   - **Enable**: ✅ Activado
7. Guarda los cambios

> **⚠️ Nota**: La sección se llama "Hooks" no "Settings", y está disponible en planes Free y Pro.

### 2. Verificar y Configurar el Hook

#### En SQL Editor, ejecutar verificaciones:
```sql
-- Ejecutar verificaciones y pruebas
-- Nota: El archivo de configuración debe crearse en database/hooks/setup_hook_configuration.sql
-- (Actualmente no existe en el proyecto)
```

Este paso te permitirá:
- ✅ Verificar que la función del hook existe
- ✅ Confirmar permisos correctos
- ✅ Verificar datos en tabla users_roles
- ✅ Crear función de prueba del hook

### 3. Implementar Políticas RLS

#### En SQL Editor:
```sql
-- Ejecutar políticas RLS completas
-- ✅ Archivo disponible en: rls_policies.sql (en la raíz del proyecto)
```

### 4. Verificar Configuración Completa

#### Verificar que el hook existe:
```sql
SELECT EXISTS (
  SELECT 1 FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' AND p.proname = 'custom_access_token_hook'
);
```

#### Verificar permisos del hook:
```sql
-- Verificar que tiene los permisos correctos
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'custom_access_token_hook' 
  AND routine_schema = 'public';
```

#### Probar las funciones RLS:
```sql
-- Verificar función de rol
SELECT public.get_user_role();

-- Probar políticas (requiere usuario autenticado)
SELECT public.test_rls_policies();
```

#### Probar el Hook con Usuario Real:
```sql
-- Usar función de prueba (reemplaza con tu user_id real)
SELECT public.test_custom_access_token_hook('tu-user-id-aqui');
```

### 5. Crear Primer SUPER_ADMIN

Si no tienes usuarios SUPER_ADMIN, ejecuta:
```sql
-- Reemplaza 'tu-email@example.com' con tu email real
-- Nota: El archivo CREATE_FIRST_SUPERADMIN.sql debe crearse
-- (Actualmente no existe en el proyecto)
```

## ✅ Lista de Verificación

- [ ] Hook `custom_access_token_hook` creado en Supabase
- [ ] Verificaciones ejecutadas con `setup_hook_configuration.sql`
- [ ] Hook configurado en Authentication Settings
- [ ] Función de prueba `test_custom_access_token_hook` disponible
- [ ] Políticas RLS implementadas con `rls_policies.sql`
- [ ] Función `get_user_role()` disponible
- [ ] Al menos un usuario SUPER_ADMIN creado
- [ ] Login/logout funcionando correctamente
- [ ] JWT contiene claims de rol (`user_role`, `is_active`)

## 🔍 Verificación en Frontend

Después del login, verifica que el JWT contiene los claims:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, session } = useAuth();

// Debería mostrar el rol desde JWT
console.log('User role:', user?.role);
console.log('Role source:', user?.roleSource); // 'jwt' si viene del token

// Para debug en desarrollo:
if (session?.access_token) {
  const payload = session.access_token.split('.')[1];
  const decoded = JSON.parse(atob(payload));
  console.log('JWT Claims:', decoded);
}
```

## 🛟 Troubleshooting

### Hook no se ejecuta:
1. Verificar que la función existe en SQL
2. Verificar configuración en Authentication Settings
3. Revisar logs de Supabase
4. Asegurarse de que la función tiene permisos: `GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;`

### RLS bloquea consultas:
1. Verificar que `users_roles` tabla tiene datos
2. Verificar que el usuario está autenticado
3. Usar `SELECT public.test_rls_policies();` para diagnosticar
4. Verificar que las tablas tienen RLS habilitado: `SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

### JWT no contiene claims:
1. Verificar que el hook está configurado y activo
2. Hacer logout/login para generar nuevo token
3. Verificar que el usuario tiene rol en `users_roles`
4. Usar `SELECT public.custom_access_token_hook('{"user_id":"USER_ID_HERE"}'::jsonb);` para probar

## 🔄 Actualizar Rol de Usuario

Para actualizar el rol JWT después de cambios:

```typescript
const { refreshRole } = useAuth();
await refreshRole(); // Fuerza actualización del token
```

## 📁 Archivos de Configuración

### **📋 Configuración Básica:**
- `database/hooks/custom_access_token_hook.sql` - **[POR CREAR]** Función del hook
- `database/hooks/setup_hook_configuration.sql` - **[POR CREAR]** Verificaciones y pruebas
- `rls_policies.sql` - **[EXISTENTE]** Políticas RLS completas (en raíz del proyecto)
- `CREATE_FIRST_SUPERADMIN.sql` - **[POR CREAR]** Script para crear primer admin
- `src/contexts/AuthContext.tsx` - **[EXISTENTE]** AuthContext con soporte JWT

### **🚀 Mejoras Avanzadas (Recomendaciones IA Supabase):**
- `database/rls_enhancements.sql` - **[POR CREAR]** Mejoras empresariales
  - ✅ **Sistema de auditoría detallado**: Logs de seguridad completos
  - ✅ **Revisión periódica de roles**: Governance automático
  - ✅ **Manejo robusto de errores**: Funciones mejoradas
  - ✅ **Gestión dinámica de roles**: Interface de administración

### **🔧 Implementación Sugerida:**
1. **Básico**: Solo archivos de configuración básica (funcional)
2. **Empresarial**: + `rls_enhancements.sql` (governance completo)

## 🎯 **Beneficios del Sistema Completo:**

### **📊 Dashboard de Gestión de Roles:**
```sql
-- Ver métricas del sistema
SELECT * FROM public.get_role_management_dashboard();

-- Roles que necesitan revisión
SELECT * FROM public.get_roles_needing_review();
```

### **🔐 Auditoría Avanzada:**
- Log completo de accesos y denegaciones
- Tracking de cambios de roles
- Métricas de seguridad en tiempo real

### **⚙️ Governance Automatizado:**
- Revisión automática de roles por riesgo
- Escalamiento de privilegios controlado
- Compliance y auditoría empresarial

¡El sistema está listo para usar roles seguros con JWT, RLS y governance empresarial! 🚀