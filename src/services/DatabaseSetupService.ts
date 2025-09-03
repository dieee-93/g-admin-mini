/**
 * Servicio para ejecutar configuración automática de base de datos
 * Contiene todas las consultas SQL necesarias para configurar g-admin desde cero
 */

import { createBrowserClient } from '@supabase/ssr';
import { supabase } from '@/lib/supabase/client';

export interface SetupProgress {
  step: string;
  description: string;
  completed: boolean;
  error?: string;
}

export class DatabaseSetupService {
  private client: ReturnType<typeof createBrowserClient>;
  private progressCallback?: (progress: SetupProgress) => void;

  constructor(
    progressCallback?: (progress: SetupProgress) => void,
    supabaseUrl?: string,
    supabaseAnonKey?: string
  ) {
    // Si se proporcionan credenciales, crear un cliente nuevo, sino usar el existente
    if (supabaseUrl && supabaseAnonKey) {
      this.client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } else {
      this.client = supabase;
    }
    this.progressCallback = progressCallback;
  }

  private reportProgress(step: string, description: string, completed: boolean, error?: string) {
    this.progressCallback?.({ step, description, completed, error });
  }

  private async executeSql(sql: string, stepName: string): Promise<void> {
    try {
      const { error } = await this.client.rpc('exec_sql', { sql_query: sql });
      if (error) {
        throw new Error(`Error en ${stepName}: ${error.message}`);
      }
    } catch {
      // Si exec_sql no existe, intentamos ejecutar las queries individualmente
      const queries = sql.split(';').filter(q => q.trim());
      for (const query of queries) {
        if (query.trim()) {
          const { error } = await this.client.rpc('sql', { query: query.trim() });
          if (error) {
            throw new Error(`Error en ${stepName}: ${error.message}`);
          }
        }
      }
    }
  }

  async runCompleteSetup(): Promise<boolean> {
    try {
      // 1. Crear tipos y enums
      this.reportProgress('types', 'Creando tipos de datos...', false);
      await this.createTypes();
      this.reportProgress('types', 'Tipos de datos creados', true);

      // 2. Crear tablas esenciales
      this.reportProgress('tables', 'Creando tablas principales...', false);
      await this.createTables();
      this.reportProgress('tables', 'Tablas principales creadas', true);

      // 3. Crear funciones SQL
      this.reportProgress('functions', 'Creando funciones SQL...', false);
      await this.createFunctions();
      this.reportProgress('functions', 'Funciones SQL creadas', true);

      // 4. Configurar RLS
      this.reportProgress('rls', 'Configurando seguridad (RLS)...', false);
      await this.configureRLS();
      this.reportProgress('rls', 'Seguridad configurada', true);

      // 5. Crear triggers
      this.reportProgress('triggers', 'Configurando triggers...', false);
      await this.createTriggers();
      this.reportProgress('triggers', 'Triggers configurados', true);

      // 6. Insertar datos iniciales
      this.reportProgress('data', 'Insertando configuración inicial...', false);
      await this.insertInitialData();
      this.reportProgress('data', 'Configuración inicial insertada', true);

      return true;
    } catch (error) {
      console.error('Error en configuración automática:', error);
      return false;
    }
  }

  private async createTypes(): Promise<void> {
    const sql = `
      -- Crear enum de roles si no existe
      DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('CLIENTE', 'OPERADOR', 'SUPERVISOR', 'ADMINISTRADOR', 'SUPER_ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `;
    await this.executeSql(sql, 'Creación de tipos');
  }

  private async createTables(): Promise<void> {
    const sql = `
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
    `;
    await this.executeSql(sql, 'Creación de tablas');
  }

  private async createFunctions(): Promise<void> {
    const sql = `
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
    `;
    await this.executeSql(sql, 'Creación de funciones');
  }

  private async configureRLS(): Promise<void> {
    const sql = `
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

      -- Políticas básicas
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
    `;
    await this.executeSql(sql, 'Configuración de RLS');
  }

  private async createTriggers(): Promise<void> {
    const sql = `
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
    `;
    await this.executeSql(sql, 'Creación de triggers');
  }

  private async insertInitialData(): Promise<void> {
    const sql = `
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

      -- Otorgar permisos básicos
      GRANT SELECT ON public.users_roles TO authenticated;
      GRANT INSERT, UPDATE ON public.users_roles TO service_role;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    `;
    await this.executeSql(sql, 'Inserción de datos iniciales');
  }
}
