-- =====================================================
-- G-Admin Custom Access Token Hook
-- Adds user role as custom claim to JWT token
-- =====================================================

-- Create the custom access token hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Added for better security context
STABLE
AS $$
DECLARE
  user_role text;
  user_is_active boolean;
  claims jsonb;
BEGIN
  -- Extract user ID from the event
  IF event->'user_id' IS NULL THEN
    RETURN event;
  END IF;

  -- Fetch user role from users_roles table (removed is_active filter)
  SELECT ur.role::text, ur.is_active
  INTO user_role, user_is_active
  FROM public.users_roles ur
  WHERE ur.user_id = (event->>'user_id')::uuid
  ORDER BY ur.created_at DESC  -- Get most recent role assignment
  LIMIT 1;

  -- Initialize claims from existing event or create new
  claims := COALESCE(event->'claims', '{}'::jsonb);

  -- Add role claim (simplified logic)
  claims := claims || jsonb_build_object(
    'user_role', COALESCE(user_role, 'CLIENTE'),
    'is_active', COALESCE(user_is_active, false),
    'role_updated_at', EXTRACT(epoch FROM NOW()),
    'app_metadata', jsonb_build_object(
      'provider', 'g-admin',
      'role_source', 'database'
    )
  );

  -- Return the modified event with updated claims
  RETURN jsonb_set(event, '{claims}', claims);

EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return event with default claims
    RAISE LOG 'Error in custom_access_token_hook: %', SQLERRM;
    
    claims := COALESCE(event->'claims', '{}'::jsonb);
    claims := claims || jsonb_build_object(
      'user_role', 'CLIENTE',
      'is_active', false,
      'error', 'role_fetch_failed',
      'role_updated_at', EXTRACT(epoch FROM NOW())
    );
    
    RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Add comment for documentation
COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS 
'Custom access token hook that adds user role from users_roles table as JWT claims. 
Used by Supabase Auth to enhance JWT tokens with role information.';
