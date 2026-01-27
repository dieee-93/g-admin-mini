-- Migration: Create brands table and add brand_id to materials
-- Date: 2026-01-10
-- Description: Normalized brands table to handle product brands with soft delete support

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT brands_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- 2. Enable RLS on brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for brands
CREATE POLICY "Brands viewable by authenticated users"
  ON public.brands FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Brands insertable by admins"
  ON public.brands FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMINISTRADOR', 'SUPERVISOR')
  );

CREATE POLICY "Brands updatable by admins"
  ON public.brands FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMINISTRADOR', 'SUPERVISOR')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMINISTRADOR', 'SUPERVISOR')
  );

CREATE POLICY "Brands deletable by admins"
  ON public.brands FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('SUPER_ADMIN', 'ADMINISTRADOR', 'SUPERVISOR')
  );

-- 4. Add brand_id to materials table
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- 5. Create index for brand_id foreign key
CREATE INDEX IF NOT EXISTS idx_materials_brand_id ON public.materials(brand_id);

-- 6. Add updated_at trigger for brands
CREATE OR REPLACE FUNCTION public.update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at_trigger
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brands_updated_at();

-- 7. Insert sample brands
INSERT INTO public.brands (name, is_active) VALUES
  ('LA SERENÍSIMA', true),
  ('ARCOR', true),
  ('MOLINOS RÍO DE LA PLATA', true),
  ('MAROLIO', true),
  ('ÁGUILA', true),
  ('PUREZA', true),
  ('TREGAR', true),
  ('SANCOR', true)
ON CONFLICT (name) DO NOTHING;

-- 8. Comment the table and columns
COMMENT ON TABLE public.brands IS 'Normalized brands table for materials inventory tracking';
COMMENT ON COLUMN public.brands.name IS 'Brand name (uppercase, unique)';
COMMENT ON COLUMN public.brands.logo_url IS 'Optional URL to brand logo image';
COMMENT ON COLUMN public.brands.is_active IS 'Soft delete flag (false = deleted)';
COMMENT ON COLUMN public.materials.brand_id IS 'Foreign key to brands table (NULL = unbranded)';
