-- =============================================
-- MIGRATION: Create Assets Table
-- Date: 2025-01-06
-- Description: Asset management with rental support
-- =============================================

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  asset_code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'equipment', 'vehicle', 'tool', 'furniture', 'electronics'

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'retired', 'rented'
  condition VARCHAR(50) NOT NULL DEFAULT 'good', -- 'excellent', 'good', 'fair', 'poor', 'broken'

  -- Financial
  purchase_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  purchase_date DATE,

  -- Location
  location VARCHAR(255),
  assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,

  -- Rental Fields (for Rentals module integration)
  is_rentable BOOLEAN DEFAULT false,
  rental_price_per_day DECIMAL(10, 2),
  rental_price_per_hour DECIMAL(10, 2),
  currently_rented BOOLEAN DEFAULT false,
  current_rental_id UUID, -- FK to rentals table (if exists)

  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER DEFAULT 90,

  -- Metadata
  notes TEXT,
  tags TEXT[], -- Array of tags for filtering
  custom_fields JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON public.assets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assets_is_rentable ON public.assets(is_rentable);
CREATE INDEX IF NOT EXISTS idx_assets_currently_rented ON public.assets(currently_rented);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN(tags);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- RLS Policies
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read assets
CREATE POLICY "Assets are viewable by authenticated users"
  ON public.assets FOR SELECT
  TO authenticated
  USING (true);

-- Allow supervisors+ to manage assets
CREATE POLICY "Assets are manageable by supervisors"
  ON public.assets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('SUPERVISOR', 'ADMIN', 'OWNER')
    )
  );

-- Comments
COMMENT ON TABLE public.assets IS 'Physical asset inventory management';
COMMENT ON COLUMN public.assets.is_rentable IS 'Whether this asset can be rented out';
COMMENT ON COLUMN public.assets.rental_price_per_day IS 'Daily rental rate (if rentable)';
COMMENT ON COLUMN public.assets.currently_rented IS 'Whether asset is currently on rental';
COMMENT ON COLUMN public.assets.current_rental_id IS 'Current active rental (if rented)';
