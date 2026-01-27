-- =====================================================
-- CONFIGURABLE ENUMS SYSTEM
-- =====================================================
-- Purpose: Convert hardcoded enums to configurable database tables
-- Enums: staff_departments, product_types, asset_categories, 
--        material_categories, loyalty_tiers
-- Created: 2025-12-22
-- =====================================================

-- 1. Create system_enums table (generic enum storage)
CREATE TABLE IF NOT EXISTS public.system_enums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Enum identification
  enum_type VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  
  -- Display information
  label VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Metadata
  icon VARCHAR(100),
  color VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false, -- System defaults cannot be deleted
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Unique constraint
  CONSTRAINT unique_enum_type_key UNIQUE(enum_type, key),
  
  -- Valid enum types
  CHECK (enum_type IN (
    'staff_department',
    'product_type',
    'asset_category',
    'material_category',
    'loyalty_tier'
  ))
);

-- 2. Create indexes
CREATE INDEX idx_system_enums_type ON public.system_enums(enum_type);
CREATE INDEX idx_system_enums_active ON public.system_enums(is_active);
CREATE INDEX idx_system_enums_type_active ON public.system_enums(enum_type, is_active);

-- 3. Enable RLS
ALTER TABLE public.system_enums ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "System enums viewable by authenticated users"
  ON public.system_enums FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "System enums manageable by admins"
  ON public.system_enums FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'manager'
  );

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_system_enums_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_enums_updated_at
  BEFORE UPDATE ON public.system_enums
  FOR EACH ROW
  EXECUTE FUNCTION update_system_enums_updated_at();

-- 6. Insert default values for STAFF DEPARTMENTS
INSERT INTO public.system_enums (enum_type, key, label, description, icon, color, sort_order, is_system) VALUES
  ('staff_department', 'kitchen', 'Cocina', 'Personal de preparación y cocina', 'fire', 'red', 10, true),
  ('staff_department', 'service', 'Servicio', 'Personal de atención al cliente y meseros', 'users', 'blue', 20, true),
  ('staff_department', 'admin', 'Administración', 'Personal administrativo y contable', 'briefcase', 'purple', 30, true),
  ('staff_department', 'cleaning', 'Limpieza', 'Personal de limpieza y mantenimiento', 'sparkles', 'green', 40, true),
  ('staff_department', 'management', 'Gerencia', 'Gerentes y supervisores', 'shield', 'orange', 50, true)
ON CONFLICT (enum_type, key) DO NOTHING;

-- 7. Insert default values for PRODUCT TYPES
INSERT INTO public.system_enums (enum_type, key, label, description, icon, color, sort_order, is_system) VALUES
  ('product_type', 'physical_product', 'Producto Físico', 'Comida preparada, retail, productos tangibles', 'cube', 'blue', 10, true),
  ('product_type', 'service', 'Servicio', 'Consultas, tratamientos, servicios profesionales', 'wrench', 'green', 20, true),
  ('product_type', 'rental', 'Alquiler', 'Alquiler de assets y equipamiento', 'clock', 'purple', 30, true),
  ('product_type', 'digital', 'Digital', 'Cursos online, ebooks, contenido digital', 'computer', 'cyan', 40, true),
  ('product_type', 'membership', 'Membresía', 'Acceso recurrente, suscripciones', 'star', 'orange', 50, true)
ON CONFLICT (enum_type, key) DO NOTHING;

-- 8. Insert default values for ASSET CATEGORIES
INSERT INTO public.system_enums (enum_type, key, label, description, icon, color, sort_order, is_system) VALUES
  ('asset_category', 'equipment', 'Equipamiento', 'Equipos y maquinaria', 'cog', 'gray', 10, true),
  ('asset_category', 'vehicle', 'Vehículos', 'Vehículos de transporte y entrega', 'truck', 'blue', 20, true),
  ('asset_category', 'tool', 'Herramientas', 'Herramientas y utensilios', 'wrench', 'orange', 30, true),
  ('asset_category', 'furniture', 'Mobiliario', 'Muebles y mobiliario', 'home', 'brown', 40, true),
  ('asset_category', 'electronics', 'Electrónicos', 'Dispositivos y equipos electrónicos', 'bolt', 'yellow', 50, true)
ON CONFLICT (enum_type, key) DO NOTHING;

-- 9. Insert default values for MATERIAL CATEGORIES
INSERT INTO public.system_enums (enum_type, key, label, description, icon, color, sort_order, is_system) VALUES
  ('material_category', 'food', 'Alimentos', 'Ingredientes alimenticios y comestibles', 'utensils', 'green', 10, true),
  ('material_category', 'beverage', 'Bebidas', 'Bebidas y líquidos', 'glass-water', 'blue', 20, true),
  ('material_category', 'packaging', 'Empaque', 'Materiales de empaque y envasado', 'box', 'brown', 30, true),
  ('material_category', 'cleaning', 'Limpieza', 'Productos de limpieza y sanitización', 'spray-can', 'cyan', 40, true),
  ('material_category', 'office', 'Oficina', 'Suministros de oficina y papelería', 'folder', 'purple', 50, true),
  ('material_category', 'raw_material', 'Materia Prima', 'Materiales crudos para producción', 'cube', 'gray', 60, true)
ON CONFLICT (enum_type, key) DO NOTHING;

-- 10. Insert default values for LOYALTY TIERS
INSERT INTO public.system_enums (enum_type, key, label, description, icon, color, sort_order, is_system) VALUES
  ('loyalty_tier', 'bronze', 'Bronce', 'Nivel inicial de lealtad', 'medal', 'bronze', 10, true),
  ('loyalty_tier', 'silver', 'Plata', 'Nivel intermedio de lealtad', 'medal', 'silver', 20, true),
  ('loyalty_tier', 'gold', 'Oro', 'Nivel avanzado de lealtad', 'medal', 'gold', 30, true),
  ('loyalty_tier', 'platinum', 'Platino', 'Nivel máximo de lealtad', 'star', 'platinum', 40, true)
ON CONFLICT (enum_type, key) DO NOTHING;

-- 11. Add comments
COMMENT ON TABLE public.system_enums IS 'Configurable system enums - replaces hardcoded values';
COMMENT ON COLUMN public.system_enums.enum_type IS 'Type of enum: staff_department, product_type, asset_category, material_category, loyalty_tier';
COMMENT ON COLUMN public.system_enums.key IS 'Unique key for the enum value (e.g., kitchen, service)';
COMMENT ON COLUMN public.system_enums.label IS 'Human-readable label';
COMMENT ON COLUMN public.system_enums.is_system IS 'System defaults cannot be deleted, only deactivated';
COMMENT ON COLUMN public.system_enums.sort_order IS 'Display order in dropdowns/lists';
