-- =====================================================
-- DIAGNÓSTICO RÁPIDO - Pega el resultado completo
-- =====================================================

-- 1. Tu usuario actual
SELECT 'My User' as info, auth.uid() as user_id, auth.email() as email;

-- 2. Estructura de users_roles
SELECT 'users_roles columns' as info, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'users_roles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Triggers en users_roles
SELECT 'Triggers on users_roles' as info, trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users_roles' AND event_object_schema = 'public';

-- 4. Constraints en users_roles
SELECT 'Constraints' as info, constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users_roles' AND table_schema = 'public';

-- 5. Roles actualmente asignados (todos los usuarios)
SELECT 'Current roles in DB' as info, user_id, role::text, is_active, created_at
FROM public.users_roles
ORDER BY created_at DESC
LIMIT 10;

-- 6. Tu rol específico
SELECT 'My current role' as info, role::text, is_active
FROM public.users_roles
WHERE user_id = auth.uid();
