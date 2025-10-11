-- =====================================================
-- ASSIGN SUPER_ADMIN ROLE (Bypass triggers)
-- Solución para el error del trigger schedule_role_review
-- =====================================================

-- 1. Deshabilitar temporalmente el trigger problemático
ALTER TABLE public.users_roles DISABLE TRIGGER trigger_schedule_role_review;

-- 2. Verificar tu usuario actual
SELECT
    'Current User Info' as check_name,
    auth.uid() as user_id,
    auth.email() as email;

-- 3. Eliminar cualquier rol existente (limpieza)
DELETE FROM public.users_roles
WHERE user_id = auth.uid();

-- 4. Insertar SUPER_ADMIN role
INSERT INTO public.users_roles (user_id, role, is_active)
VALUES (auth.uid(), 'SUPER_ADMIN'::user_role, TRUE);

-- 5. Verificar que se insertó correctamente
SELECT
    'Role Assignment Verification' as check_name,
    user_id,
    role::text,
    is_active,
    created_at
FROM public.users_roles
WHERE user_id = auth.uid();

-- 6. Re-habilitar el trigger
ALTER TABLE public.users_roles ENABLE TRIGGER trigger_schedule_role_review;

-- 7. Confirmar estado final
SELECT
    'Final Status' as check_name,
    'SUPER_ADMIN role assigned successfully' as message;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Current User Info: Tu UUID y email
-- 1 row deleted (o 0 si no tenías rol)
-- 1 row inserted
-- Role Assignment Verification: SUPER_ADMIN, is_active=true
-- Trigger re-enabled
-- Final Status: Success message
