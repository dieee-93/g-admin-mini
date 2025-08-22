-- =====================================================
-- G-ADMIN MINI - POLÍTICAS RLS COMPLETAS 
-- Compatible con @supabase/ssr
-- Fecha: 2025-01-22
-- Versión: 2.0
-- =====================================================

-- =====================================================
-- UTILITY FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user role from JWT token or users_roles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role text;
    current_user_id uuid;
BEGIN
    -- Get current user ID from auth
    current_user_id := auth.uid();
    
    -- Return null if no authenticated user
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Try to get role from JWT claims first (faster)
    user_role := (auth.jwt() ->> 'user_role')::text;
    
    -- If not found in JWT, get from users_roles table
    IF user_role IS NULL THEN
        SELECT role::text INTO user_role
        FROM public.users_roles 
        WHERE user_id = current_user_id 
          AND is_active = true
        LIMIT 1;
    END IF;
    
    -- Default to CLIENTE if no role found
    RETURN COALESCE(user_role, 'CLIENTE');
END;
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN get_user_role() = required_role;
END;
$$;

-- Function to check if user has minimum role level
CREATE OR REPLACE FUNCTION public.user_has_min_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_role text;
    role_hierarchy jsonb;
BEGIN
    current_role := get_user_role();
    
    -- Role hierarchy (higher number = more permissions)
    role_hierarchy := '{
        "CLIENTE": 1,
        "OPERADOR": 2, 
        "SUPERVISOR": 3,
        "ADMINISTRADOR": 4,
        "SUPER_ADMIN": 5
    }'::jsonb;
    
    RETURN (role_hierarchy ->> current_role)::int >= (role_hierarchy ->> required_role)::int;
END;
$$;

-- Function to check if user owns a record (for customer data access)
CREATE OR REPLACE FUNCTION public.user_owns_customer_record(customer_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT auth.uid() = customer_user_id;
$$;

-- =====================================================
-- USERS_ROLES TABLE POLICIES (Already exists but verify)
-- =====================================================

-- Ensure RLS is enabled on users_roles
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "users_can_read_own_role" ON public.users_roles;
DROP POLICY IF EXISTS "super_admin_can_manage_roles" ON public.users_roles;

-- Policy 1: Users can read their own role
CREATE POLICY "users_can_read_own_role" ON public.users_roles
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy 2: Only SUPER_ADMIN can manage all roles
CREATE POLICY "super_admin_can_manage_roles" ON public.users_roles
  FOR ALL 
  USING (user_has_role('SUPER_ADMIN'))
  WITH CHECK (user_has_role('SUPER_ADMIN'));

-- =====================================================
-- MATERIALS/INVENTORY TABLES POLICIES
-- =====================================================

-- Items Table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- CLIENTE: No access to items
-- OPERADOR+: Can read all items
CREATE POLICY "operador_can_read_items" ON public.items
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can insert/update items
CREATE POLICY "operador_can_modify_items" ON public.items
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_update_items" ON public.items
  FOR UPDATE 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete items
CREATE POLICY "supervisor_can_delete_items" ON public.items
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Stock Entries Table
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read all stock entries
CREATE POLICY "operador_can_read_stock_entries" ON public.stock_entries
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create stock entries
CREATE POLICY "operador_can_create_stock_entries" ON public.stock_entries
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can update/delete stock entries
CREATE POLICY "supervisor_can_modify_stock_entries" ON public.stock_entries
  FOR UPDATE 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));

CREATE POLICY "supervisor_can_delete_stock_entries" ON public.stock_entries
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Suppliers Table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read suppliers
CREATE POLICY "operador_can_read_suppliers" ON public.suppliers
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can manage suppliers
CREATE POLICY "supervisor_can_manage_suppliers" ON public.suppliers
  FOR ALL 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));

-- Categories Table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read categories
CREATE POLICY "operador_can_read_categories" ON public.categories
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can manage categories
CREATE POLICY "supervisor_can_manage_categories" ON public.categories
  FOR ALL 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));

-- =====================================================
-- PRODUCTS TABLES POLICIES
-- =====================================================

-- Products Table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can read active products (for menu viewing)
CREATE POLICY "cliente_can_read_active_products" ON public.products
  FOR SELECT 
  USING (user_has_role('CLIENTE') AND is_active = true);

-- OPERADOR+: Can read all products
CREATE POLICY "operador_can_read_all_products" ON public.products
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create/update products
CREATE POLICY "operador_can_modify_products" ON public.products
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_update_products" ON public.products
  FOR UPDATE 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete products
CREATE POLICY "supervisor_can_delete_products" ON public.products
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Product Components Table
ALTER TABLE public.product_components ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read product components
CREATE POLICY "operador_can_read_product_components" ON public.product_components
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can manage product components
CREATE POLICY "operador_can_manage_product_components" ON public.product_components
  FOR ALL 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- RECIPES TABLES POLICIES
-- =====================================================

-- Recipes Table
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read all recipes
CREATE POLICY "operador_can_read_recipes" ON public.recipes
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create/update recipes
CREATE POLICY "operador_can_modify_recipes" ON public.recipes
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_update_recipes" ON public.recipes
  FOR UPDATE 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete recipes
CREATE POLICY "supervisor_can_delete_recipes" ON public.recipes
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Recipe Ingredients Table
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read recipe ingredients
CREATE POLICY "operador_can_read_recipe_ingredients" ON public.recipe_ingredients
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can manage recipe ingredients
CREATE POLICY "operador_can_manage_recipe_ingredients" ON public.recipe_ingredients
  FOR ALL 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- CUSTOMERS TABLES POLICIES
-- =====================================================

-- Customers Table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can only read/update their own customer record
-- Note: This assumes customers table has a user_id field linking to auth.users
CREATE POLICY "cliente_can_access_own_data" ON public.customers
  FOR ALL 
  USING (
    user_has_role('CLIENTE') AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = customers.email
    )
  )
  WITH CHECK (
    user_has_role('CLIENTE') AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = customers.email
    )
  );

-- OPERADOR+: Can read all customers
CREATE POLICY "operador_can_read_customers" ON public.customers
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create/update customers
CREATE POLICY "operador_can_modify_customers" ON public.customers
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_update_customers" ON public.customers
  FOR UPDATE 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete customers
CREATE POLICY "supervisor_can_delete_customers" ON public.customers
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Customer RFM Profiles Table
ALTER TABLE public.customer_rfm_profiles ENABLE ROW LEVEL SECURITY;

-- SUPERVISOR+: Can read customer analytics
CREATE POLICY "supervisor_can_read_customer_rfm" ON public.customer_rfm_profiles
  FOR SELECT 
  USING (user_has_min_role('SUPERVISOR'));

-- ADMINISTRADOR+: Can manage customer analytics
CREATE POLICY "admin_can_manage_customer_rfm" ON public.customer_rfm_profiles
  FOR ALL 
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- =====================================================
-- SALES TABLES POLICIES
-- =====================================================

-- Sales Table
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can read their own sales
CREATE POLICY "cliente_can_read_own_sales" ON public.sales
  FOR SELECT 
  USING (
    user_has_role('CLIENTE') AND 
    customer_id IN (
      SELECT c.id FROM public.customers c
      JOIN auth.users u ON u.email = c.email
      WHERE u.id = auth.uid()
    )
  );

-- OPERADOR+: Can read all sales
CREATE POLICY "operador_can_read_sales" ON public.sales
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create sales
CREATE POLICY "operador_can_create_sales" ON public.sales
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can update/delete sales
CREATE POLICY "supervisor_can_modify_sales" ON public.sales
  FOR UPDATE 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));

CREATE POLICY "supervisor_can_delete_sales" ON public.sales
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Sale Items Table
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can read their own sale items
CREATE POLICY "cliente_can_read_own_sale_items" ON public.sale_items
  FOR SELECT 
  USING (
    user_has_role('CLIENTE') AND 
    sale_id IN (
      SELECT s.id FROM public.sales s
      JOIN public.customers c ON s.customer_id = c.id
      JOIN auth.users u ON u.email = c.email
      WHERE u.id = auth.uid()
    )
  );

-- OPERADOR+: Can read all sale items
CREATE POLICY "operador_can_read_sale_items" ON public.sale_items
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can manage sale items
CREATE POLICY "operador_can_manage_sale_items" ON public.sale_items
  FOR ALL 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- RESTAURANT OPERATIONS TABLES POLICIES
-- =====================================================

-- Tables Table
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read all tables
CREATE POLICY "operador_can_read_tables" ON public.tables
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can manage tables
CREATE POLICY "supervisor_can_manage_tables" ON public.tables
  FOR ALL 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));

-- Orders Table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can read their own orders
CREATE POLICY "cliente_can_read_own_orders" ON public.orders
  FOR SELECT 
  USING (
    user_has_role('CLIENTE') AND 
    customer_id IN (
      SELECT c.id FROM public.customers c
      JOIN auth.users u ON u.email = c.email
      WHERE u.id = auth.uid()
    )
  );

-- OPERADOR+: Can read all orders
CREATE POLICY "operador_can_read_orders" ON public.orders
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can create/update orders
CREATE POLICY "operador_can_modify_orders" ON public.orders
  FOR INSERT 
  WITH CHECK (user_has_min_role('OPERADOR'));

CREATE POLICY "operador_can_update_orders" ON public.orders
  FOR UPDATE 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can delete orders
CREATE POLICY "supervisor_can_delete_orders" ON public.orders
  FOR DELETE 
  USING (user_has_min_role('SUPERVISOR'));

-- Order Items Table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- CLIENTE: Can read their own order items
CREATE POLICY "cliente_can_read_own_order_items" ON public.order_items
  FOR SELECT 
  USING (
    user_has_role('CLIENTE') AND 
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.customers c ON o.customer_id = c.id
      JOIN auth.users u ON u.email = c.email
      WHERE u.id = auth.uid()
    )
  );

-- OPERADOR+: Can manage order items
CREATE POLICY "operador_can_manage_order_items" ON public.order_items
  FOR ALL 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- Parties Table
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read all parties
CREATE POLICY "operador_can_read_parties" ON public.parties
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- OPERADOR+: Can manage parties
CREATE POLICY "operador_can_manage_parties" ON public.parties
  FOR ALL 
  USING (user_has_min_role('OPERADOR'))
  WITH CHECK (user_has_min_role('OPERADOR'));

-- =====================================================
-- STAFF MANAGEMENT POLICIES (Conditional)
-- =====================================================

-- Apply policies only if tables exist
DO $$ 
BEGIN
    -- Schedules Table
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'schedules') THEN
        EXECUTE 'ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'CREATE POLICY "supervisor_can_read_schedules" ON public.schedules
          FOR SELECT 
          USING (user_has_min_role(''SUPERVISOR''))';
          
        EXECUTE 'CREATE POLICY "supervisor_can_manage_schedules" ON public.schedules
          FOR ALL 
          USING (user_has_min_role(''SUPERVISOR''))
          WITH CHECK (user_has_min_role(''SUPERVISOR''))';
    END IF;

    -- Shifts Table
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'shifts') THEN
        EXECUTE 'ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'CREATE POLICY "supervisor_can_manage_shifts" ON public.shifts
          FOR ALL 
          USING (user_has_min_role(''SUPERVISOR''))
          WITH CHECK (user_has_min_role(''SUPERVISOR''))';
    END IF;

    -- Time Off Requests Table
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'time_off_requests') THEN
        EXECUTE 'ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY';
        
        EXECUTE 'CREATE POLICY "supervisor_can_manage_time_off" ON public.time_off_requests
          FOR ALL 
          USING (user_has_min_role(''SUPERVISOR''))
          WITH CHECK (user_has_min_role(''SUPERVISOR''))';
    END IF;
END $$;

-- =====================================================
-- ANALYTICS AND PERFORMANCE POLICIES
-- =====================================================

-- Daily Analytics Table
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- SUPERVISOR+: Can read analytics
CREATE POLICY "supervisor_can_read_daily_analytics" ON public.daily_analytics
  FOR SELECT 
  USING (user_has_min_role('SUPERVISOR'));

-- ADMINISTRADOR+: Can manage analytics
CREATE POLICY "admin_can_manage_daily_analytics" ON public.daily_analytics
  FOR ALL 
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- Menu Performance Table
ALTER TABLE public.menu_performance ENABLE ROW LEVEL SECURITY;

-- SUPERVISOR+: Can read menu performance
CREATE POLICY "supervisor_can_read_menu_performance" ON public.menu_performance
  FOR SELECT 
  USING (user_has_min_role('SUPERVISOR'));

-- ADMINISTRADOR+: Can manage menu performance
CREATE POLICY "admin_can_manage_menu_performance" ON public.menu_performance
  FOR ALL 
  USING (user_has_min_role('ADMINISTRADOR'))
  WITH CHECK (user_has_min_role('ADMINISTRADOR'));

-- Recipe Performance Table
ALTER TABLE public.recipe_performance ENABLE ROW LEVEL SECURITY;

-- OPERADOR+: Can read recipe performance
CREATE POLICY "operador_can_read_recipe_performance" ON public.recipe_performance
  FOR SELECT 
  USING (user_has_min_role('OPERADOR'));

-- SUPERVISOR+: Can manage recipe performance
CREATE POLICY "supervisor_can_manage_recipe_performance" ON public.recipe_performance
  FOR ALL 
  USING (user_has_min_role('SUPERVISOR'))
  WITH CHECK (user_has_min_role('SUPERVISOR'));
