-- =====================================================
-- CUSTOM ACCESS TOKEN HOOK
-- Injects user_role into JWT for RLS policies
-- =====================================================

-- This hook is called by Supabase Auth to customize the JWT
-- Based on official Supabase documentation pattern
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    claims jsonb;
    user_role text;
    user_id uuid;
BEGIN
    -- Extract claims and user_id from event
    claims := event->'claims';
    user_id := (event->>'user_id')::uuid;

    -- Get user role from users_roles table
    SELECT role::text INTO user_role
    FROM public.users_roles
    WHERE users_roles.user_id = custom_access_token_hook.user_id
    LIMIT 1;

    -- If no role found, assign default CLIENTE role
    IF user_role IS NULL THEN
        user_role := 'CLIENTE';

        -- Insert default role into users_roles table
        INSERT INTO public.users_roles (user_id, role)
        VALUES (user_id, 'CLIENTE'::user_role)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Inject user_role into JWT claims
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));

    -- Return event with modified claims
    RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant execute permission to supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;

-- =====================================================
-- ENABLE THE HOOK IN SUPABASE AUTH CONFIG
-- =====================================================
-- After running this script, you MUST configure Supabase to use this hook:
--
-- 1. Go to Supabase Dashboard → Project Settings → Auth → Custom Access Token Hook
-- 2. Enable the hook and enter: custom_access_token_hook
-- 3. OR add to your Supabase config:
--    auth.hook.custom_access_token.enabled = true
--    auth.hook.custom_access_token.uri = "pg-functions://postgres/public/custom_access_token_hook"
--
-- OR via SQL (if you have access to auth schema):
-- UPDATE auth.config
-- SET hook_custom_access_token_enabled = true,
--     hook_custom_access_token_uri = 'pg-functions://postgres/public/custom_access_token_hook';
-- =====================================================

-- Test the hook (replace with your user_id)
SELECT custom_access_token_hook(jsonb_build_object(
    'user_id', auth.uid()::text,
    'claims', jsonb_build_object(
        'sub', auth.uid()::text,
        'email', auth.email()
    )
));
