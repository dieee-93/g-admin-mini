-- =====================================================
-- G-Admin Custom Access Token Hook - OPTIMIZED VERSION
-- Adds user role as custom claim to JWT token
-- =====================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- Added for better security context
STABLE            -- Maintains existing stable attribute
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text := 'CLIENTE';  -- Default role with explicit initialization
    v_is_active boolean := false;   -- Default active status
BEGIN
    -- Early return if no user_id present
    v_user_id := (event->>'user_id')::uuid;
    IF v_user_id IS NULL THEN
        RETURN event;
    END IF;

    -- Optimized single query with COALESCE
    -- SMALL FIX: Removed the AND ur.is_active = true filter to handle inactive users properly
    SELECT 
        COALESCE(ur.role, 'CLIENTE'),
        COALESCE(ur.is_active, false)
    INTO 
        v_user_role, 
        v_is_active
    FROM public.users_roles ur
    WHERE ur.user_id = v_user_id
    ORDER BY ur.created_at DESC  -- Get most recent role assignment
    LIMIT 1;

    -- Construct claims with improved readability and performance
    RETURN jsonb_set(event, 
        '{claims}', 
        (COALESCE(event->'claims', '{}'::jsonb) || jsonb_build_object(
            'user_role', v_user_role,
            'is_active', v_is_active,
            'role_updated_at', EXTRACT(epoch FROM NOW()),
            'app_metadata', jsonb_build_object(
                'provider', 'g-admin',
                'role_source', 'database'
            )
        ))
    );

EXCEPTION 
    WHEN OTHERS THEN
        -- Simplified error handling with minimal logging
        RAISE LOG 'Role fetch error for user %: %', v_user_id, SQLERRM;
        
        RETURN jsonb_set(event, 
            '{claims}', 
            (COALESCE(event->'claims', '{}'::jsonb) || jsonb_build_object(
                'user_role', 'CLIENTE',
                'is_active', false,
                'error', 'role_fetch_failed',
                'role_updated_at', EXTRACT(epoch FROM NOW())
            ))
        );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;

-- Add comprehensive comment for documentation
COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS 
'Custom access token hook to enrich JWT tokens with user role information.

Features:
- Retrieves user role from users_roles table
- Defaults to ''CLIENTE'' role if no active role found
- Adds role and metadata to JWT claims
- Handles edge cases with robust error management
- Returns actual is_active status for proper authorization

Parameters:
- event: Incoming auth event JSON
Returns enriched JWT claims JSON

Security: SECURITY DEFINER ensures proper database access context
Performance: Single query with COALESCE for optimal execution
';