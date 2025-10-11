-- =====================================================
-- FIX MISSING RLS POLICIES
-- Addresses Supabase linter errors about RLS disabled
-- =====================================================

-- Enable RLS on tables that are missing it
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_rfm_update_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_update_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_async_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_async_dead_letter_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RECIPES TABLE POLICIES
-- =====================================================

-- OPERADOR+: Can read all recipes
CREATE POLICY "operador_can_read_recipes" ON public.recipes
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create recipes
CREATE POLICY "operador_can_create_recipes" ON public.recipes
  FOR INSERT
  WITH CHECK (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can update recipes
CREATE POLICY "operador_can_update_recipes" ON public.recipes
  FOR UPDATE
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete recipes
CREATE POLICY "supervisor_can_delete_recipes" ON public.recipes
  FOR DELETE
  USING (user_has_min_role('SUPERVISOR'));

-- =====================================================
-- RECIPE_INGREDIENTS TABLE POLICIES
-- =====================================================

CREATE POLICY "operador_can_read_recipe_ingredients" ON public.recipe_ingredients
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_manage_recipe_ingredients" ON public.recipe_ingredients
  FOR ALL
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- CATEGORIES TABLE POLICIES
-- =====================================================

-- Everyone can read active categories
CREATE POLICY "public_can_read_categories" ON public.categories
  FOR SELECT
  USING (true);

-- OPERADOR+: Can manage categories
CREATE POLICY "operador_can_manage_categories" ON public.categories
  FOR ALL
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- CUSTOMER RFM TABLES POLICIES (Background processing)
-- =====================================================

-- System tables - only ADMIN+ can access
CREATE POLICY "admin_can_access_rfm_queue" ON public.customer_rfm_update_queue
  FOR ALL
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

CREATE POLICY "admin_can_access_customer_log" ON public.customer_update_log
  FOR ALL
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- =====================================================
-- POS ASYNC OPERATIONS POLICIES (Background processing)
-- =====================================================

-- OPERADOR+: Can read async operations
CREATE POLICY "operador_can_read_async_ops" ON public.pos_async_operations
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));

-- ADMIN+: Can manage async operations
CREATE POLICY "admin_can_manage_async_ops" ON public.pos_async_operations
  FOR ALL
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- ADMIN+: Can access dead letter queue
CREATE POLICY "admin_can_access_dlq" ON public.pos_async_dead_letter_queue
  FOR ALL
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- =====================================================
-- FIX TABLES WITH RLS ENABLED BUT NO POLICIES
-- =====================================================

-- customer_rfm_profiles - OPERADOR+ can read, ADMIN+ can modify
CREATE POLICY "operador_can_read_rfm_profiles" ON public.customer_rfm_profiles
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));

CREATE POLICY "admin_can_manage_rfm_profiles" ON public.customer_rfm_profiles
  FOR ALL
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- menu_engineering_analysis - SUPERVISOR+ can read
CREATE POLICY "supervisor_can_read_menu_analysis" ON public.menu_engineering_analysis
  FOR SELECT
  USING (user_has_min_role('SUPERVISOR'));

-- recipe_performance - OPERADOR+ can read
CREATE POLICY "operador_can_read_recipe_performance" ON public.recipe_performance
  FOR SELECT
  USING (user_has_min_role('OPERADOR'));

-- =====================================================
-- VERIFY POLICIES WERE CREATED
-- =====================================================

SELECT
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policies
FROM pg_policies
WHERE tablename IN (
    'recipes',
    'recipe_ingredients',
    'categories',
    'customer_rfm_update_queue',
    'customer_update_log',
    'pos_async_operations',
    'pos_async_dead_letter_queue',
    'customer_rfm_profiles',
    'menu_engineering_analysis',
    'recipe_performance'
)
GROUP BY tablename
ORDER BY tablename;
