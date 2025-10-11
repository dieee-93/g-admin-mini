# Análisis de Prácticas RLS con Documentación Oficial de Supabase

## ✅ Lo que estamos haciendo CORRECTO

### 1. Arquitectura de Seguridad
**Nuestra decisión**: Usar RLS (Row Level Security) + Supabase Auth en lugar de `secureApiCall` frontend

**Documentación oficial dice**:
> "RLS is incredibly powerful and flexible, allowing you to write complex SQL rules that fit your unique business needs."
> "Use RLS for granular authorization rules at the database level - ideal for defense in depth"

✅ **CORRECTO**: RLS en la base de datos es la capa de seguridad real, no JavaScript en el frontend.

### 2. Custom Claims para RBAC (Role-Based Access Control)
**Nuestra implementación**:
- Tabla `users_roles` para almacenar roles
- Enum con jerarquía: CLIENTE → OPERADOR → SUPERVISOR → ADMIN → SUPER_ADMIN
- Función `get_user_role()` para obtener el rol
- Función `user_has_min_role()` para jerarquía

**Documentación oficial dice**:
> "Create custom database tables to track roles and permissions"
> "Use Custom Access Token Auth Hook to add role information to JWT"
> "Create an authorize() function to check user permissions"

✅ **CORRECTO**: Estamos siguiendo el patrón oficial de Supabase.

### 3. Políticas RLS por Rol
**Nuestras políticas**:
```sql
CREATE POLICY "operador_can_read_sales" ON public.sales
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));
```

**Documentación oficial dice**:
> "Create separate policies for SELECT, INSERT, UPDATE, and DELETE operations"
> "Use helper functions like auth.uid() to simplify policy logic"

✅ **CORRECTO**: Políticas granulares con funciones helper.

## ⚠️ PROBLEMA IDENTIFICADO: Custom Access Token Hook

### El Issue Real

**Nuestra función `get_user_role()` intenta**:
1. Primero: Leer `user_role` del JWT (`auth.jwt() ->> 'user_role'`)
2. Si no existe: Consultar tabla `users_roles`

**El problema**: El JWT NO tiene el claim `user_role` porque el Custom Access Token Hook NO está habilitado.

**Documentación oficial dice**:
> "To implement RBAC with custom claims, use a Custom Access Token Auth Hook. This hook runs **before a token is issued**."
> "You must enable the hook in Supabase Dashboard → Project Settings → Auth → Custom Access Token Hook"

### ❌ CAUSA RAÍZ de los errores 400

1. Usuario se autentica → Supabase genera JWT
2. JWT NO incluye `user_role` (hook no habilitado)
3. RLS policy ejecuta → llama a `get_user_role()`
4. `get_user_role()` consulta JWT → NULL
5. `get_user_role()` consulta tabla `users_roles` → pero usa SECURITY DEFINER
6. Política RLS bloquea acceso → **400 Bad Request**

## 🔧 SOLUCIONES (2 Opciones)

### Opción A: Habilitar Custom Access Token Hook (RECOMENDADO por Supabase)

**Pasos**:
1. Ejecutar `database/setup_custom_access_token_hook.sql` en Supabase SQL Editor
2. Ir a Supabase Dashboard → Authentication → Hooks
3. Habilitar "Custom Access Token Hook"
4. Configurar función: `custom_access_token_hook`
5. Guardar y reiniciar sesión (logout/login)

**Ventajas**:
- ✅ Mejor rendimiento (rol en JWT, no consulta a DB en cada request)
- ✅ Patrón oficial de Supabase
- ✅ Escalable para millones de requests

**Desventajas**:
- Requiere logout/login para aplicar
- Cambios de rol requieren nueva sesión

### Opción B: Modificar get_user_role() para SIEMPRE consultar tabla

**Modificación**:
```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    current_user_id uuid;
BEGIN
    current_user_id := auth.uid();

    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- SIEMPRE consultar tabla (no depender de JWT)
    SELECT role::text INTO user_role
    FROM public.users_roles
    WHERE user_id = current_user_id
    LIMIT 1;

    -- Si no existe, retornar rol por defecto
    IF user_role IS NULL THEN
        RETURN 'CLIENTE';
    END IF;

    RETURN user_role;
END;
$$;
```

**Ventajas**:
- ✅ Cambios de rol se aplican inmediatamente
- ✅ No requiere configuración en Dashboard
- ✅ Funciona sin el hook

**Desventajas**:
- ❌ Query adicional en cada request (impacto en rendimiento)
- ❌ No sigue el patrón recomendado por Supabase

## 📊 Comparación con Documentación Oficial

| Aspecto | Nuestra Implementación | Doc Oficial | Status |
|---------|------------------------|-------------|--------|
| RLS habilitado en tablas | ✅ Sí | ✅ Requerido | ✅ CORRECTO |
| Tabla users_roles | ✅ Sí | ✅ Recomendado | ✅ CORRECTO |
| Jerarquía de roles | ✅ user_has_min_role() | ✅ authorize() | ✅ CORRECTO |
| Custom claims en JWT | ❌ Hook no habilitado | ✅ Usar Auth Hook | ⚠️ FALTA HABILITAR |
| Políticas granulares | ✅ Por operación | ✅ Recomendado | ✅ CORRECTO |
| Funciones SECURITY DEFINER | ✅ Con SET search_path | ⚠️ Warning en linter | ⚠️ NORMAL (ver abajo) |

### Nota sobre "Function Search Path Mutable"

**Warning de Supabase**:
> "Function has a role mutable search_path"

**Nuestra implementación**:
```sql
SECURITY DEFINER
SET search_path = public
```

✅ **ESTO ES CORRECTO**: Estamos fijando el `search_path = public`, que es la práctica recomendada.

**Documentación dice**:
> "Use SET search_path in SECURITY DEFINER functions to prevent search_path injection attacks"

El warning de Supabase es porque detecta funciones SECURITY DEFINER, pero nosotros SÍ estamos usando `SET search_path`, así que es seguro.

## 🎯 RECOMENDACIÓN FINAL

**OPCIÓN A** (Habilitar Custom Access Token Hook) es el camino correcto porque:

1. ✅ Es el patrón oficial de Supabase
2. ✅ Mejor rendimiento (JWT cacheado vs query en cada request)
3. ✅ Escalable para producción
4. ✅ Sigue las mejores prácticas de la industria

**OPCIÓN B** (Consultar tabla siempre) solo si:
- No puedes acceder al Dashboard de Supabase
- Necesitas cambios de rol en tiempo real sin logout
- Estás en desarrollo/testing

## 📝 PRÓXIMOS PASOS RECOMENDADOS

1. ✅ Ejecutar `database/diagnostic_rls_issue.sql` para confirmar diagnóstico
2. ⚠️ Decidir: Opción A (hook) o Opción B (consulta directa)
3. 🔧 Implementar solución elegida
4. ✅ Ejecutar `database/fix_missing_rls_policies.sql` (para recipes, categories, etc.)
5. ✅ Probar Sales module

## 🔗 Referencias de Documentación Oficial

- [Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Performance Advisors](https://supabase.com/docs/guides/database/database-advisors)
