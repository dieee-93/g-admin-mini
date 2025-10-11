-- =====================================================
-- CHECK ENUM STATUS 
-- Verificar qué enum existe y su contenido
-- =====================================================

-- 1. Buscar todos los enums relacionados con roles
SELECT
    'Available role enums' as check_name,
    t.typname as enum_name,
    string_agg(e.enumlabel::text, ', ' ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%role%'
GROUP BY t.typname;

-- 2. Ver estructura de tabla users_roles
SELECT
    'users_roles table structure' as check_name,
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name = 'users_roles'
ORDER BY ordinal_position;

-- 3. Contar usuarios en users_roles
SELECT
    'Total users with roles' as check_name,
    COUNT(*) as user_count
FROM public.users_roles;

-- 4. Ver roles asignados
SELECT
    'Roles distribution' as check_name,
    role,
    COUNT(*) as count
FROM public.users_roles
GROUP BY role;
