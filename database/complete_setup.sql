-- =====================================================
-- 🚀 G-ADMIN MINI: AUTO-SETUP COMPLETO
-- 
-- INSTRUCCIONES:
-- 1. Copia TODO este script
-- 2. Ve a tu proyecto Supabase → SQL Editor
-- 3. Pega el script completo
-- 4. Haz clic en "Run"
-- 5. Regresa a g-admin y haz clic en "Verificar Configuración"
-- 
-- Este script es IDEMPOTENTE (se puede ejecutar múltiples veces)
-- =====================================================

-- =====================================================
-- 1. TIPOS Y ENUMS
-- =====================================================

-- Crear enum de roles si no existe
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. TABLAS ESENCIALES
-- =====================================================

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS public.users_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CLIENTE',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users_roles
CREATE INDEX IF NOT EXISTS idx_users_roles_user_id ON public.users_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_roles_active ON public.users_roles(user_id, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_roles_unique_active 
ON public.users_roles(user_id) 
WHERE is_active = TRUE;

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de materiales
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  base_unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  precision_digits INTEGER DEFAULT 2,
  supplier_id UUID,
  barcode TEXT,
  description TEXT,
  storage_requirements TEXT,
  expiry_days INTEGER,
  recipe_id UUID,
  requires_production BOOLEAN DEFAULT FALSE,
  auto_calculate_cost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  contact_person TEXT,
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  user_id UUID REFERENCES auth.users(id),
  birth_date DATE,
  preferences JSONB DEFAULT '{}',
  loyalty_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de recetas
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  yield_quantity INTEGER DEFAULT 1,
  yield_unit TEXT DEFAULT 'porción',
  preparation_time INTEGER DEFAULT 0,
  cooking_time INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'medium',
  category TEXT,
  tags TEXT[],
  cost_per_serving DECIMAL(10,2) DEFAULT 0,
  profit_margin DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ingredientes de recetas
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  preparation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  table_number INTEGER,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de artículos de venta
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id),
  material_id UUID REFERENCES public.materials(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entradas de inventario
CREATE TABLE IF NOT EXISTS public.inventory_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  invoice_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mesas (para restaurantes)
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  zone TEXT DEFAULT 'main',
  status TEXT DEFAULT 'available',
  x_position INTEGER DEFAULT 0,
  y_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. FUNCIONES SQL CRÍTICAS
-- =====================================================

-- Función para obtener el rol del usuario
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_value TEXT;
BEGIN
  -- Obtener el rol del usuario actual
  SELECT role::TEXT INTO user_role_value
  FROM public.users_roles 
  WHERE user_id = auth.uid() 
    AND is_active = true
  LIMIT 1;
  
  -- Retornar CLIENTE por defecto si no se encuentra rol
  RETURN COALESCE(user_role_value, 'CLIENTE');
END;
$$;

-- Función para verificar acceso
CREATE OR REPLACE FUNCTION public.check_user_access(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_role TEXT;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  current_role := public.get_user_role();
  
  -- Jerarquía de roles
  role_hierarchy := CASE current_role
    WHEN 'CLIENTE' THEN 1
    WHEN 'OPERADOR' THEN 2
    WHEN 'SUPERVISOR' THEN 3
    WHEN 'ADMINISTRADOR' THEN 4
    WHEN 'SUPER_ADMIN' THEN 5
    ELSE 0
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'CLIENTE' THEN 1
    WHEN 'OPERADOR' THEN 2
    WHEN 'SUPERVISOR' THEN 3
    WHEN 'ADMINISTRADOR' THEN 4
    WHEN 'SUPER_ADMIN' THEN 5
    ELSE 0
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$;

-- Función para asignar rol por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Asignar rol CLIENTE a nuevos usuarios
    INSERT INTO public.users_roles (user_id, role)
    VALUES (NEW.id, 'CLIENTE');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Trigger para asignar rol automáticamente
DROP TRIGGER IF EXISTS assign_default_role_trigger ON auth.users;
CREATE TRIGGER assign_default_role_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION assign_default_role();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at en todas las tablas relevantes
CREATE TRIGGER update_users_roles_updated_at BEFORE UPDATE ON public.users_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Políticas básicas - OPERADOR+ puede acceder a la mayoría de datos
-- Users pueden ver su propio rol
CREATE POLICY "users_can_read_own_role" ON public.users_roles
  FOR SELECT USING (user_id = auth.uid());

-- SUPER_ADMIN puede gestionar roles
CREATE POLICY "super_admin_can_manage_roles" ON public.users_roles
  FOR ALL USING (public.check_user_access('SUPER_ADMIN'));

-- System config: ADMINISTRADOR+ puede gestionar
CREATE POLICY "admin_can_manage_system_config" ON public.system_config
  FOR ALL USING (public.check_user_access('ADMINISTRADOR'));

-- Políticas para módulos operativos
CREATE POLICY "operador_can_read_materials" ON public.materials
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "supervisor_can_manage_materials" ON public.materials
  FOR ALL USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "operador_can_read_suppliers" ON public.suppliers
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "supervisor_can_manage_suppliers" ON public.suppliers
  FOR ALL USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "operador_can_read_customers" ON public.customers
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "operador_can_manage_customers" ON public.customers
  FOR ALL USING (public.check_user_access('OPERADOR'));

CREATE POLICY "operador_can_read_recipes" ON public.recipes
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "supervisor_can_manage_recipes" ON public.recipes
  FOR ALL USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "operador_can_read_recipe_ingredients" ON public.recipe_ingredients
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "supervisor_can_manage_recipe_ingredients" ON public.recipe_ingredients
  FOR ALL USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "operador_can_manage_sales" ON public.sales
  FOR ALL USING (public.check_user_access('OPERADOR'));

CREATE POLICY "operador_can_manage_sale_items" ON public.sale_items
  FOR ALL USING (public.check_user_access('OPERADOR'));

CREATE POLICY "operador_can_read_inventory" ON public.inventory_entries
  FOR SELECT USING (public.check_user_access('OPERADOR'));

CREATE POLICY "supervisor_can_manage_inventory" ON public.inventory_entries
  FOR ALL USING (public.check_user_access('SUPERVISOR'));

CREATE POLICY "operador_can_manage_tables" ON public.tables
  FOR ALL USING (public.check_user_access('OPERADOR'));

-- =====================================================
-- 6. CONFIGURACIÓN INICIAL
-- =====================================================

-- Insertar configuración inicial básica
INSERT INTO public.system_config (key, value, description) VALUES
('company_info', '{"name": "Mi Empresa", "setup_completed": false}', 'Información básica de la empresa'),
('onboarding_completed', 'false', 'Estado del tutorial inicial'),
('version', '1.0.0', 'Versión del sistema'),
('setup_date', NOW()::TEXT, 'Fecha de configuración inicial')
ON CONFLICT (key) DO NOTHING;

-- Crear algunas mesas básicas
INSERT INTO public.tables (table_number, capacity, zone) VALUES
(1, 4, 'main'),
(2, 4, 'main'),
(3, 2, 'main'),
(4, 6, 'main'),
(5, 4, 'terrace'),
(6, 4, 'terrace')
ON CONFLICT (table_number) DO NOTHING;

-- =====================================================
-- 7. PERMISOS
-- =====================================================

-- Otorgar permisos básicos
GRANT SELECT ON public.users_roles TO authenticated;
GRANT INSERT, UPDATE ON public.users_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. COMENTARIOS
-- =====================================================

COMMENT ON TABLE public.users_roles IS 'Sistema de roles para control de acceso';
COMMENT ON TABLE public.system_config IS 'Configuración global del sistema';
COMMENT ON TABLE public.materials IS 'Inventario de materias primas y productos';
COMMENT ON TABLE public.suppliers IS 'Proveedores de materiales';
COMMENT ON TABLE public.customers IS 'Base de datos de clientes';
COMMENT ON TABLE public.recipes IS 'Recetas y fórmulas de producción';
COMMENT ON TABLE public.sales IS 'Registro de ventas';
COMMENT ON TABLE public.tables IS 'Mesas para servicio de restaurante';

-- =====================================================
-- 9. SEÑAL DE CONFIGURACIÓN COMPLETADA
-- =====================================================

-- Marcar que la configuración automática está completa
INSERT INTO public.system_config (key, value, description) VALUES
('auto_setup_completed', 'true', 'Indica que la configuración automática fue ejecutada exitosamente'),
('auto_setup_timestamp', NOW()::TEXT, 'Timestamp de cuando se completó la configuración automática'),
('auto_setup_version', '1.0.0', 'Versión del script de auto-setup utilizado')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- =====================================================
-- 10. VERIFICACIÓN FINAL Y REPORTE
-- =====================================================

-- Verificar que todo esté configurado correctamente
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Contar tablas esenciales
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users_roles', 'system_config', 'materials', 'suppliers', 'customers', 'recipes', 'sales', 'tables');
    
    -- Contar funciones críticas
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN ('get_user_role', 'check_user_access');
    
    RAISE NOTICE 'Configuración completada:';
    RAISE NOTICE '- Tablas esenciales: % de 8', table_count;
    RAISE NOTICE '- Funciones críticas: % de 2', function_count;
    
    IF table_count = 8 AND function_count = 2 THEN
        RAISE NOTICE '✅ CONFIGURACIÓN EXITOSA - Base de datos lista para g-admin';
    ELSE
        RAISE WARNING '⚠️ CONFIGURACIÓN INCOMPLETA - Revisar errores anteriores';
    END IF;
END $$;

-- Resultado final
SELECT 
  '🎉 G-Admin Mini Database Setup Complete!' as status,
  'La base de datos está lista. Regresa a g-admin y haz clic en "Verificar Configuración"' as next_step,
  NOW() as completed_at;
