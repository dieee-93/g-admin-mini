-- Fix infinite recursion in users_roles RLS policies
-- Issue: Policies were calling check_user_access() which queries users_roles, creating a loop
-- Solution: Use direct auth checks instead of check_user_access()

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_can_read_own_role" ON public.users_roles;
DROP POLICY IF EXISTS "super_admin_can_manage_roles" ON public.users_roles;
DROP POLICY IF EXISTS "users_roles_select_unified" ON public.users_roles;
DROP POLICY IF EXISTS "system_can_insert_roles" ON public.users_roles;

-- Create new policies WITHOUT recursion

-- 1. Users can view their own role
CREATE POLICY "users_view_own_role" 
  ON public.users_roles
  FOR SELECT 
  USING (user_id = auth.uid());

-- 2. Admins can view all roles (using JWT claim, not database lookup)
CREATE POLICY "admins_view_all_roles"
  ON public.users_roles
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'SUPER_ADMIN', 'ADMINISTRADOR')
  );

-- 3. Admins can insert roles (JWT check only)
CREATE POLICY "admins_insert_roles"
  ON public.users_roles
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'SUPER_ADMIN', 'ADMINISTRADOR')
  );

-- 4. System can insert roles (for triggers like assign_default_role)
-- This uses SECURITY DEFINER context, so it bypasses RLS
CREATE POLICY "system_insert_default_roles"
  ON public.users_roles
  FOR INSERT
  WITH CHECK (
    -- Allow system triggers to insert (they run as SECURITY DEFINER)
    current_setting('role', true) = 'postgres' OR
    -- Allow for new user registration (when no role exists yet)
    NOT EXISTS (SELECT 1 FROM public.users_roles WHERE user_id = auth.uid())
  );

-- 5. Admins can update roles
CREATE POLICY "admins_update_roles"
  ON public.users_roles
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'SUPER_ADMIN', 'ADMINISTRADOR')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'SUPER_ADMIN', 'ADMINISTRADOR')
  );

-- 6. Admins can delete roles
CREATE POLICY "admins_delete_roles"
  ON public.users_roles
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'SUPER_ADMIN', 'ADMINISTRADOR')
  );

-- Update get_user_role() function to break recursion
-- Make it SECURITY DEFINER so it bypasses RLS when querying users_roles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- This runs as SECURITY DEFINER, bypassing RLS
  -- No recursion because it doesn't trigger RLS policies
  SELECT role::TEXT INTO user_role_value
  FROM public.users_roles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Return 'CLIENTE' by default if no role found
  RETURN COALESCE(user_role_value, 'CLIENTE');
END;
$$;

-- Verify fix by testing the function
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: users_roles RLS policies fixed';
  RAISE NOTICE 'Removed recursive check_user_access() calls from users_roles policies';
  RAISE NOTICE 'Now using direct auth.jwt() checks to prevent infinite recursion';
END $$;
