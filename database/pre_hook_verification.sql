-- =====================================================
-- PRE-HOOK VERIFICATION
-- Ejecutar ANTES de habilitar el Custom Access Token Hook
-- =====================================================

-- 1. Verificar que estás autenticado
SELECT
    'Current User' as check_name,
    auth.uid() as user_id,
    auth.email() as email;

-- 2. Verificar que la tabla users_roles existe
SELECT
    'users_roles table exists' as check_name,
    EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users_roles'
    ) as result;

-- 3. Verificar que el enum user_role existe con todos los roles
SELECT
    'user_role enum exists' as check_name,
    string_agg(enumlabel::text, ', ' ORDER BY enumsortorder) as roles
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role';

-- 4. Verificar tu rol actual en la tabla
SELECT
    'Your current role' as check_name,
    COALESCE(role::text, 'NO ROLE ASSIGNED') as result
FROM public.users_roles
WHERE user_id = auth.uid();

-- 5. Si no tienes rol, asignar SUPER_ADMIN
DO $$
BEGIN
    -- Solo ejecutar si el usuario no tiene rol
    IF NOT EXISTS (SELECT 1 FROM public.users_roles WHERE user_id = auth.uid()) THEN
        INSERT INTO public.users_roles (user_id, role)
        VALUES (auth.uid(), 'SUPER_ADMIN'::user_role);

        RAISE NOTICE 'SUPER_ADMIN role assigned to user %', auth.uid();
    ELSE
        RAISE NOTICE 'User already has a role assigned';
    END IF;
END $$;

-- 6. Confirmar rol después del insert
SELECT
    'Final role verification' as check_name,
    role::text as your_role
FROM public.users_roles
WHERE user_id = auth.uid();

-- 7. Verificar que las funciones RLS existen
SELECT
    'RLS Functions Status' as check_name,
    string_agg(p.proname, ', ' ORDER BY p.proname) as functions_exist
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('get_user_role', 'user_has_role', 'user_has_min_role');

-- 8. Verificar que las tablas críticas tienen RLS habilitado
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('sales', 'products', 'tables', 'customers', 'materials')
ORDER BY tablename;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- 1. Current User: Debe mostrar tu UUID y email
-- 2. users_roles table exists: true
-- 3. user_role enum exists: CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN
-- 4. Your current role: SUPER_ADMIN (o el rol que tengas)
-- 5. NOTICE: "User already has a role assigned" o "SUPER_ADMIN role assigned"
-- 6. Final role verification: SUPER_ADMIN
-- 7. RLS Functions Status: get_user_role, user_has_min_role, user_has_role
-- 8. Todas las tablas deben tener rls_enabled = true

-- =====================================================
-- PRÓXIMO PASO:
-- =====================================================
-- Si todos los checks pasan, ejecutar:
-- database/setup_custom_access_token_hook.sql
