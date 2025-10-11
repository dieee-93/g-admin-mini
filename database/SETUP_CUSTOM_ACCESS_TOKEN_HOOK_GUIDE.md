# Guía: Habilitar Custom Access Token Hook en Supabase

## 📋 Requisitos Previos

- ✅ Tabla `users_roles` creada
- ✅ Enum `app_role` con valores: CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN
- ✅ Tu usuario tiene rol asignado en `users_roles`

## 🚀 Paso 1: Ejecutar el Script SQL

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script: `database/setup_custom_access_token_hook.sql`
3. Verifica que no haya errores (debe mostrar "Success")

## ⚙️ Paso 2: Habilitar el Hook en Supabase Dashboard

### Opción A: Desde el Dashboard (Recomendado)

1. Ve a **Supabase Dashboard**
2. **Authentication** → **Hooks**
3. En la sección **"Custom Access Token Hook"**:
   - ✅ Toggle: **Enable Hook**
   - **Function Name**: `custom_access_token_hook`
   - **Schema**: `public`
4. Haz clic en **Save** / **Guardar**

### Opción B: Via SQL (Si tienes acceso al schema auth)

```sql
-- Solo si tienes permisos de superusuario en Supabase
UPDATE auth.config
SET
  hook_custom_access_token_enabled = true,
  hook_custom_access_token_uri = 'pg-functions://postgres/public/custom_access_token_hook';
```

**NOTA**: La mayoría de proyectos Supabase usan la Opción A desde el Dashboard.

## 🔄 Paso 3: Cerrar Sesión y Volver a Iniciar Sesión

**IMPORTANTE**: El hook solo se ejecuta cuando se genera un NUEVO JWT.

1. En tu aplicación G-Admin Mini:
   - Cierra sesión (Sign Out)
   - Vuelve a iniciar sesión con tu usuario

2. O simplemente recarga el token:
   ```typescript
   // En la consola del navegador
   await supabase.auth.refreshSession()
   ```

## ✅ Paso 4: Verificar que Funciona

### 4.1 Verificar JWT en el navegador

1. Abre **DevTools** → **Application/Aplicación** → **Local Storage**
2. Busca la key que contiene `supabase.auth.token`
3. Copia el access_token
4. Pégalo en [jwt.io](https://jwt.io)
5. Verifica que en el payload aparezca:
   ```json
   {
     "user_role": "SUPER_ADMIN",
     "sub": "...",
     "email": "...",
     // ... otros claims
   }
   ```

### 4.2 Verificar desde SQL

Ejecuta en **Supabase SQL Editor** (mientras estás logueado):

```sql
-- Debe retornar tu user_role
SELECT (auth.jwt() ->> 'user_role')::text as user_role_from_jwt;

-- Debe retornar TRUE para SUPER_ADMIN
SELECT public.get_user_role() as role;
SELECT public.user_has_min_role('OPERADOR') as has_operador_role;
```

### 4.3 Probar Sales Module

1. Ve a `/admin/sales` en tu aplicación
2. El módulo debe cargar SIN errores 400
3. Verifica en Network tab que las peticiones a Supabase retornen **200 OK**

## 🐛 Troubleshooting

### Problema: Sigo viendo errores 400

**Solución**:
1. Verifica que el hook está habilitado: Dashboard → Authentication → Hooks
2. Cierra sesión COMPLETAMENTE y vuelve a iniciar sesión
3. Limpia Local Storage del navegador
4. Ejecuta `database/diagnostic_rls_issue.sql` para diagnosticar

### Problema: JWT no tiene user_role

**Solución**:
1. Verifica que la función `custom_access_token_hook` existe:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'custom_access_token_hook';
   ```
2. Verifica permisos:
   ```sql
   SELECT has_function_privilege('supabase_auth_admin', 'public.custom_access_token_hook(jsonb)', 'EXECUTE');
   ```
   Debe retornar `true`

### Problema: Usuario no tiene rol en users_roles

**Solución**:
El hook creará automáticamente el rol CLIENTE. Pero si necesitas SUPER_ADMIN:

```sql
-- Inserta tu rol manualmente
INSERT INTO public.users_roles (user_id, role)
VALUES (auth.uid(), 'SUPER_ADMIN'::app_role)
ON CONFLICT (user_id)
DO UPDATE SET role = 'SUPER_ADMIN'::app_role;
```

Luego cierra sesión y vuelve a iniciar sesión.

## 📊 Verificación Completa

Ejecuta este script para verificar todo:

```sql
-- 1. Hook existe
SELECT 'Hook Function Exists' as check_name,
       EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'custom_access_token_hook') as result;

-- 2. Permisos correctos
SELECT 'Hook Permissions' as check_name,
       has_function_privilege('supabase_auth_admin', 'public.custom_access_token_hook(jsonb)', 'EXECUTE') as result;

-- 3. Usuario autenticado
SELECT 'User Authenticated' as check_name,
       (auth.uid() IS NOT NULL) as result;

-- 4. User role en tabla
SELECT 'User Role in Table' as check_name,
       role::text as result
FROM public.users_roles
WHERE user_id = auth.uid();

-- 5. User role en JWT
SELECT 'User Role in JWT' as check_name,
       (auth.jwt() ->> 'user_role')::text as result;

-- 6. get_user_role() funciona
SELECT 'get_user_role() Works' as check_name,
       public.get_user_role() as result;

-- 7. Jerarquía de roles funciona
SELECT 'Role Hierarchy Check' as check_name,
       public.user_has_min_role('OPERADOR') as result;
```

**Resultado esperado**: Todos los checks deben retornar valores válidos (no NULL).

## ✅ Éxito Confirmado

Si ves:
- ✅ JWT tiene `user_role` claim
- ✅ `get_user_role()` retorna tu rol
- ✅ Sales module carga sin errores 400
- ✅ Network requests retornan 200 OK

**¡El hook está funcionando correctamente!** 🎉

## 📝 Próximos Pasos

Después de confirmar que el hook funciona:

1. ✅ Ejecutar `database/fix_missing_rls_policies.sql` (para recipes, categories, etc.)
2. ✅ Probar otros módulos (Materials, Customers, etc.)
3. ✅ Verificar que los warnings de Supabase linter se reduzcan

---

**Documentación oficial**: [Custom Access Token Hook | Supabase Docs](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
