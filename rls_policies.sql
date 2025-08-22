-- =====================================================
-- G-ADMIN MINI: COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- Compatible with @supabase/ssr authentication system
-- =====================================================
-- Version: 1.0
-- Date: August 2025
-- Description: Complete RLS implementation for all G-Admin tables
-- Roles: CLIENTE, OPERADOR, SUPERVISOR, ADMINISTRADOR, SUPER_ADMIN

-- =====================================================
-- UTILITY FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user role from JWT token or users_roles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role_value TEXT;
BEGIN
    -- First try to get role from JWT custom claims (via @supabase/ssr)
    user_role_value := (auth.jwt() ->> 'user_role')::TEXT;
    
    -- If not found in JWT, get from users_roles table
    IF user_role_value IS NULL THEN
        SELECT role::TEXT INTO user_role_value
        FROM public.users_roles 
        WHERE user_id = auth.uid() 
          AND is_active = true
        LIMIT 1;
    END IF;
    
    -- Return role or default to CLIENTE
    RETURN COALESCE(user_role_value, 'CLIENTE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has required role or higher
CREATE OR REPLACE FUNCTION public.check_user_access(required_role TEXT DEFAULT 'CLIENTE')
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
    role_hierarchy INTEGER;
BEGIN
    -- Return false if not authenticated
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    current_role := public.get_user_role();
    
    -- Define role hierarchy (higher number = more permissions)
    role_hierarchy := CASE current_role
        WHEN 'CLIENTE' THEN 1
        WHEN 'OPERADOR' THEN 2
        WHEN 'SUPERVISOR' THEN 3
        WHEN 'ADMINISTRADOR' THEN 4
        WHEN 'SUPER_ADMIN' THEN 5
        ELSE 0
    END;
    
    -- Check if user has required role or higher
    RETURN role_hierarchy >= CASE required_role
        WHEN 'CLIENTE' THEN 1
        WHEN 'OPERADOR' THEN 2
        WHEN 'SUPERVISOR' THEN 3
        WHEN 'ADMINISTRADOR' THEN 4
        WHEN 'SUPER_ADMIN' THEN 5
        ELSE 99 -- Invalid role requires max permissions
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns or has access to customer data
CREATE OR REPLACE FUNCTION public.check_customer_access(customer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_role TEXT;
BEGIN
    current_role := public.get_user_role();
    
    -- SUPER_ADMIN and ADMINISTRADOR have full access
    IF current_role IN ('SUPER_ADMIN', 'ADMINISTRADOR') THEN
        RETURN TRUE;
    END IF;
    
    -- SUPERVISOR and OPERADOR have operational access
    IF current_role IN ('SUPERVISOR', 'OPERADOR') THEN
        RETURN TRUE;
    END IF;
    
    -- CLIENTE can only access their own data
    IF current_role = 'CLIENTE' THEN
        -- Check if this customer record belongs to the current user
        RETURN EXISTS (
            SELECT 1 FROM public.customers c 
            WHERE c.id = customer_id 
            AND c.created_by = auth.uid()
        );
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CORE INVENTORY TABLES RLS POLICIES
-- =====================================================

-- ITEMS (Materials/Raw Materials)
-- Operadores+ can manage inventory
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- SELECT: OPERADOR+ can view all items
CREATE POLICY "items_select_policy" ON public.items
    FOR SELECT USING (public.check_user_access('OPERADOR'));

-- INSERT: OPERADOR+ can create items
CREATE POLICY "items_insert_policy" ON public.items
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

-- UPDATE: OPERADOR+ can update items
CREATE POLICY "items_update_policy" ON public.items
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

-- DELETE: SUPERVISOR+ can delete items
CREATE POLICY "items_delete_policy" ON public.items
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- STOCK ENTRIES
-- Track all stock movements with proper access control
ALTER TABLE public.stock_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_entries_select_policy" ON public.stock_entries
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "stock_entries_insert_policy" ON public.stock_entries
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "stock_entries_update_policy" ON public.stock_entries
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

-- Only SUPERVISOR+ can delete stock entries
CREATE POLICY "stock_entries_delete_policy" ON public.stock_entries
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- SUPPLIERS
-- Supplier management for procurement
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_policy" ON public.suppliers
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "suppliers_insert_policy" ON public.suppliers
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "suppliers_update_policy" ON public.suppliers
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "suppliers_delete_policy" ON public.suppliers
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- CATEGORIES
-- Product/item categorization
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "categories_insert_policy" ON public.categories
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "categories_update_policy" ON public.categories
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "categories_delete_policy" ON public.categories
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- =====================================================
-- RECIPE AND PRODUCT MANAGEMENT
-- =====================================================

-- RECIPES
-- Recipe management and costing
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipes_select_policy" ON public.recipes
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "recipes_insert_policy" ON public.recipes
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "recipes_update_policy" ON public.recipes
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "recipes_delete_policy" ON public.recipes
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- RECIPE INGREDIENTS
-- Recipe ingredient relationships
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipe_ingredients_select_policy" ON public.recipe_ingredients
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "recipe_ingredients_insert_policy" ON public.recipe_ingredients
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "recipe_ingredients_update_policy" ON public.recipe_ingredients
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "recipe_ingredients_delete_policy" ON public.recipe_ingredients
    FOR DELETE USING (public.check_user_access('OPERADOR'));

-- PRODUCTS
-- Product catalog management
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_policy" ON public.products
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "products_insert_policy" ON public.products
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "products_update_policy" ON public.products
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "products_delete_policy" ON public.products
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- PRODUCT COMPONENTS
-- Product ingredient relationships
ALTER TABLE public.product_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_components_select_policy" ON public.product_components
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "product_components_insert_policy" ON public.product_components
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "product_components_update_policy" ON public.product_components
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "product_components_delete_policy" ON public.product_components
    FOR DELETE USING (public.check_user_access('OPERADOR'));

-- =====================================================
-- CUSTOMER MANAGEMENT
-- =====================================================

-- CUSTOMERS
-- Customer data with privacy protection
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- SELECT: OPERADOR+ see all customers, CLIENTE sees only their own
CREATE POLICY "customers_select_policy" ON public.customers
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR 
        public.check_customer_access(id)
    );

-- INSERT: OPERADOR+ can create customers, CLIENTE can create their own profile
CREATE POLICY "customers_insert_policy" ON public.customers
    FOR INSERT WITH CHECK (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE')
    );

-- UPDATE: OPERADOR+ can update all, CLIENTE can update their own
CREATE POLICY "customers_update_policy" ON public.customers
    FOR UPDATE USING (
        public.check_user_access('OPERADOR') OR 
        public.check_customer_access(id)
    )
    WITH CHECK (
        public.check_user_access('OPERADOR') OR 
        public.check_customer_access(id)
    );

-- DELETE: SUPERVISOR+ can delete customers
CREATE POLICY "customers_delete_policy" ON public.customers
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- CUSTOMER RFM PROFILES
-- Customer analytics and segmentation
ALTER TABLE public.customer_rfm_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_rfm_profiles_select_policy" ON public.customer_rfm_profiles
    FOR SELECT USING (public.check_user_access('OPERADOR'));

-- Only system can insert/update RFM profiles (automated)
CREATE POLICY "customer_rfm_profiles_insert_policy" ON public.customer_rfm_profiles
    FOR INSERT WITH CHECK (public.check_user_access('ADMINISTRADOR'));

CREATE POLICY "customer_rfm_profiles_update_policy" ON public.customer_rfm_profiles
    FOR UPDATE USING (public.check_user_access('ADMINISTRADOR'))
    WITH CHECK (public.check_user_access('ADMINISTRADOR'));

-- CUSTOMER RFM UPDATE QUEUE
-- System queue for RFM calculations
ALTER TABLE public.customer_rfm_update_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_rfm_update_queue_policy" ON public.customer_rfm_update_queue
    FOR ALL USING (public.check_user_access('ADMINISTRADOR'));

-- CUSTOMER UPDATE LOG
-- Audit trail for customer changes
ALTER TABLE public.customer_update_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_update_log_select_policy" ON public.customer_update_log
    FOR SELECT USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "customer_update_log_insert_policy" ON public.customer_update_log
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

-- =====================================================
-- RESTAURANT OPERATIONS
-- =====================================================

-- TABLES
-- Restaurant table management
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tables_select_policy" ON public.tables
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "tables_insert_policy" ON public.tables
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "tables_update_policy" ON public.tables
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "tables_delete_policy" ON public.tables
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- PARTIES
-- Customer party/group management
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parties_select_policy" ON public.parties
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND customer_id IN (
            SELECT id FROM public.customers WHERE created_by = auth.uid()
        ))
    );

CREATE POLICY "parties_insert_policy" ON public.parties
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "parties_update_policy" ON public.parties
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "parties_delete_policy" ON public.parties
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- ORDERS
-- Order management system
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_policy" ON public.orders
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND customer_id IN (
            SELECT id FROM public.customers WHERE created_by = auth.uid()
        ))
    );

CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "orders_update_policy" ON public.orders
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "orders_delete_policy" ON public.orders
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- ORDER ITEMS
-- Individual order item management
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select_policy" ON public.order_items
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND order_id IN (
            SELECT id FROM public.orders o
            JOIN public.customers c ON o.customer_id = c.id
            WHERE c.created_by = auth.uid()
        ))
    );

CREATE POLICY "order_items_insert_policy" ON public.order_items
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "order_items_update_policy" ON public.order_items
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "order_items_delete_policy" ON public.order_items
    FOR DELETE USING (public.check_user_access('OPERADOR'));

-- =====================================================
-- SALES AND PAYMENTS
-- =====================================================

-- SALES
-- Sales transaction management
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select_policy" ON public.sales
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND customer_id IN (
            SELECT id FROM public.customers WHERE created_by = auth.uid()
        ))
    );

CREATE POLICY "sales_insert_policy" ON public.sales
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "sales_update_policy" ON public.sales
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "sales_delete_policy" ON public.sales
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- SALE ITEMS
-- Individual sale item management
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sale_items_select_policy" ON public.sale_items
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND sale_id IN (
            SELECT s.id FROM public.sales s
            JOIN public.customers c ON s.customer_id = c.id
            WHERE c.created_by = auth.uid()
        ))
    );

CREATE POLICY "sale_items_insert_policy" ON public.sale_items
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "sale_items_update_policy" ON public.sale_items
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "sale_items_delete_policy" ON public.sale_items
    FOR DELETE USING (public.check_user_access('OPERADOR'));

-- PAYMENT METHODS
-- Payment processing and tracking
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_methods_select_policy" ON public.payment_methods
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "payment_methods_insert_policy" ON public.payment_methods
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "payment_methods_update_policy" ON public.payment_methods
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "payment_methods_delete_policy" ON public.payment_methods
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- =====================================================
-- STAFF AND SCHEDULING
-- =====================================================

-- SCHEDULES
-- Staff scheduling management
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_policy" ON public.schedules
    FOR SELECT USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "schedules_insert_policy" ON public.schedules
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "schedules_update_policy" ON public.schedules
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "schedules_delete_policy" ON public.schedules
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- SHIFTS
-- Individual shift management
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shifts_select_policy" ON public.shifts
    FOR SELECT USING (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid())
    );

CREATE POLICY "shifts_insert_policy" ON public.shifts
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shifts_update_policy" ON public.shifts
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shifts_delete_policy" ON public.shifts
    FOR DELETE USING (public.check_user_access('SUPERVISOR'));

-- SHIFT TEMPLATES
-- Shift template management
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shift_templates_select_policy" ON public.shift_templates
    FOR SELECT USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shift_templates_insert_policy" ON public.shift_templates
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shift_templates_update_policy" ON public.shift_templates
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "shift_templates_delete_policy" ON public.shift_templates
    FOR DELETE USING (public.check_user_access('ADMINISTRADOR'));

-- TIME OFF REQUESTS
-- Employee time-off management
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_off_requests_select_policy" ON public.time_off_requests
    FOR SELECT USING (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid())
    );

CREATE POLICY "time_off_requests_insert_policy" ON public.time_off_requests
    FOR INSERT WITH CHECK (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid())
    );

CREATE POLICY "time_off_requests_update_policy" ON public.time_off_requests
    FOR UPDATE USING (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid() AND status = 'pending')
    )
    WITH CHECK (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid() AND status = 'pending')
    );

CREATE POLICY "time_off_requests_delete_policy" ON public.time_off_requests
    FOR DELETE USING (
        public.check_user_access('SUPERVISOR') OR
        (public.check_user_access('OPERADOR') AND employee_id = auth.uid() AND status = 'pending')
    );

-- =====================================================
-- ANALYTICS AND FINAL CONFIGURATIONS
-- =====================================================

-- DAILY ANALYTICS - Business performance metrics
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_analytics_select_policy" ON public.daily_analytics
    FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "daily_analytics_insert_policy" ON public.daily_analytics
    FOR INSERT WITH CHECK (public.check_user_access('SUPERVISOR'));

CREATE POLICY "daily_analytics_update_policy" ON public.daily_analytics
    FOR UPDATE USING (public.check_user_access('SUPERVISOR'))
    WITH CHECK (public.check_user_access('SUPERVISOR'));

-- INVOICES - Financial operations
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_policy" ON public.invoices
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND customer_id IN (
            SELECT id FROM public.customers WHERE created_by = auth.uid()
        ))
    );

CREATE POLICY "invoices_insert_policy" ON public.invoices
    FOR INSERT WITH CHECK (public.check_user_access('OPERADOR'));

CREATE POLICY "invoices_update_policy" ON public.invoices
    FOR UPDATE USING (public.check_user_access('OPERADOR'))
    WITH CHECK (public.check_user_access('OPERADOR'));

-- RESERVATIONS - Customer reservation management
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_select_policy" ON public.reservations
    FOR SELECT USING (
        public.check_user_access('OPERADOR') OR
        (public.get_user_role() = 'CLIENTE' AND customer_id IN (
            SELECT id FROM public.customers WHERE created_by = auth.uid()
        ))
    );

CREATE POLICY "reservations_insert_policy" ON public.reservations
    FOR INSERT WITH CHECK (
        public.check_user_access('OPERADOR') OR
        public.get_user_role() = 'CLIENTE'
    );

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Index on users_roles for frequent role checks
CREATE INDEX IF NOT EXISTS idx_users_roles_active_role 
ON public.users_roles(user_id, role, is_active) WHERE is_active = true;

-- Index for customer access checks
CREATE INDEX IF NOT EXISTS idx_customers_created_by 
ON public.customers(created_by) WHERE created_by IS NOT NULL;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant utility function permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_user_access(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_customer_access(UUID) TO authenticated, anon;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant service_role elevated permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- TESTING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    result := result || '=== RLS POLICY TEST RESULTS ===' || E'\n';
    
    -- Test utility functions
    BEGIN
        result := result || 'get_user_role(): ' || COALESCE(public.get_user_role(), 'NULL') || E'\n';
        result := result || 'check_user_access(OPERADOR): ' || public.check_user_access('OPERADOR')::TEXT || E'\n';
    EXCEPTION WHEN OTHERS THEN
        result := result || 'ERROR: ' || SQLERRM || E'\n';
    END;
    
    result := result || '=== END RLS TEST ===' || E'\n';
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated;

-- Add documentation comments
COMMENT ON FUNCTION public.get_user_role() IS 'Gets current user role from JWT or users_roles table. Compatible with @supabase/ssr.';
COMMENT ON FUNCTION public.check_user_access(TEXT) IS 'Checks if user has required role or higher in hierarchy.';
COMMENT ON FUNCTION public.check_customer_access(UUID) IS 'Checks customer data access based on role and ownership.';

SELECT 'G-Admin Mini RLS policies successfully created!' as result;
