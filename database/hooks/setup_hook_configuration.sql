-- =====================================================
-- Configuración del Custom Access Token Hook en Supabase
-- =====================================================

-- 1. Primero, ejecuta la función del hook (custom_access_token_hook.sql)

-- 2. Configurar el hook en la configuración de Supabase
-- IMPORTANTE: Esto se debe ejecutar en el SQL Editor de Supabase Dashboard
-- o mediante la CLI de Supabase

-- Verificar que la función existe
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc p 
  JOIN pg_namespace n ON p.pronamespace = n.oid 
  WHERE n.nspname = 'public' 
    AND p.proname = 'custom_access_token_hook'
) AS hook_function_exists;

-- Verificar permisos
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'custom_access_token_hook' 
  AND routine_schema = 'public';

-- Verificar que la tabla users_roles existe y tiene datos
SELECT 
  COUNT(*) as total_roles,
  COUNT(CASE WHEN is_active THEN 1 END) as active_roles,
  string_agg(DISTINCT role::text, ', ') as available_roles
FROM public.users_roles;

-- Función de prueba para verificar el hook
CREATE OR REPLACE FUNCTION public.test_custom_access_token_hook(test_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  test_event jsonb;
  result jsonb;
BEGIN
  -- Crear evento de prueba
  test_event := jsonb_build_object(
    'user_id', test_user_id,
    'claims', '{}'::jsonb
  );
  
  -- Ejecutar el hook
  result := public.custom_access_token_hook(test_event);
  
  RETURN result;
END;
$$;

-- Ejemplo de uso de la función de prueba
-- SELECT public.test_custom_access_token_hook('tu-user-id-aqui');
