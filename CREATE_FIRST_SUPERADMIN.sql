-- ================================================
-- CREATE FIRST SUPER_ADMIN USER
-- ================================================
-- This script promotes Diego Soro to SUPER_ADMIN
-- Execute this in Supabase SQL Editor
-- ================================================

-- Step 1: Update Diego Soro's role to SUPER_ADMIN
UPDATE public.users_roles 
SET 
    role = 'SUPER_ADMIN',
    updated_at = NOW(),
    assigned_by = user_id -- Self-assigned for bootstrap
WHERE user_id = 'b4236e2b-311f-4fdb-b727-7efaa7ee189c' 
AND is_active = TRUE;

-- Step 2: Verify the update worked
SELECT 
    ur.user_id,
    au.email,
    ur.role,
    ur.is_active,
    ur.updated_at
FROM public.users_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.user_id = 'b4236e2b-311f-4fdb-b727-7efaa7ee189c';

-- Step 3: Show all users and their roles for verification
SELECT 
    ur.user_id,
    au.email,
    ur.role,
    ur.is_active,
    ur.created_at
FROM public.users_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.is_active = TRUE
ORDER BY ur.created_at;

-- Step 4: Test the super admin check function
SELECT check_user_is_super_admin('b4236e2b-311f-4fdb-b727-7efaa7ee189c') as is_super_admin;

SELECT 'Diego Soro has been promoted to SUPER_ADMIN successfully!' as status;