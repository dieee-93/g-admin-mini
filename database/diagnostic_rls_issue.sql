-- =====================================================
-- DIAGNOSTIC SCRIPT FOR RLS 400 ERROR
-- Execute this in Supabase SQL Editor while logged in
-- =====================================================

-- 1. Check current user authentication
SELECT
    'Current User ID' as check_name,
    auth.uid() as result;

-- 2. Check JWT contents (should have user_role field)
SELECT
    'JWT Contents' as check_name,
    auth.jwt() as result;

-- 3. Extract user_role from JWT
SELECT
    'User Role from JWT' as check_name,
    (auth.jwt() ->> 'user_role')::text as result;

-- 4. Check users_roles table for current user
SELECT
    'User Role from users_roles' as check_name,
    ur.role as result
FROM public.users_roles ur
WHERE ur.user_id = auth.uid();

-- 5. Test get_user_role() function
SELECT
    'get_user_role() Result' as check_name,
    public.get_user_role() as result;

-- 6. Test user_has_min_role() for different roles
SELECT
    'Has OPERADOR role' as check_name,
    public.user_has_min_role('OPERADOR') as result
UNION ALL
SELECT
    'Has SUPERVISOR role' as check_name,
    public.user_has_min_role('SUPERVISOR') as result
UNION ALL
SELECT
    'Has SUPER_ADMIN role' as check_name,
    public.user_has_min_role('SUPER_ADMIN') as result;

-- 7. Check if RLS functions exist
SELECT
    'RLS Functions Status' as check_name,
    string_agg(p.proname, ', ') as result
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('get_user_role', 'user_has_role', 'user_has_min_role');

-- 8. Check RLS status on critical tables
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('sales', 'products', 'tables')
ORDER BY tablename;

-- 9. Check active policies on sales table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('sales', 'products', 'tables')
ORDER BY tablename, policyname;

-- =====================================================
-- EXPECTED RESULTS:
-- =====================================================
-- 1. Current User ID: Should show your UUID
-- 2. JWT Contents: Should have user_role field
-- 3. User Role from JWT: Should be 'SUPER_ADMIN'
-- 4. User Role from users_roles: Should be 'SUPER_ADMIN'
-- 5. get_user_role() Result: Should be 'SUPER_ADMIN'
-- 6. Has X role: All should be TRUE for SUPER_ADMIN
-- 7. RLS Functions: Should list all 3 functions
-- 8. RLS Status: All should show rls_enabled = true
-- 9. Active Policies: Should list policies for each table
