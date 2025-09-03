-- Devuelve el número de usuarios activos con rol SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.get_superadmin_count()
RETURNS INTEGER AS $$
DECLARE
  count_superadmin INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_superadmin
  FROM public.users_roles
  WHERE role = 'SUPER_ADMIN' AND is_active = TRUE;
  RETURN count_superadmin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Permitir SELECT para todos los usuarios si no existe ningún SUPER_ADMIN
-- (esto se debe configurar en la tabla users_roles, ejemplo)
--
-- CREATE POLICY "allow_superadmin_count_if_none" ON public.users_roles
--   FOR SELECT USING (
--     (SELECT COUNT(*) FROM public.users_roles WHERE role = 'SUPER_ADMIN' AND is_active = TRUE) = 0
--     OR auth.uid() IS NOT NULL
--   );
--
-- ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.users_roles FORCE ROW LEVEL SECURITY;
--
-- Nota: La función solo expone el conteo, nunca datos personales.
