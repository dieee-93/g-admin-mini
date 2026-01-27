-- Migration: Create production_batches table
-- Purpose: Track production execution (immediate and scheduled) for elaborated materials
-- Date: 2026-01-07
-- Related: Recipe Module - Production Config Section

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  
  -- Quantities (using DECIMAL for precision)
  expected_quantity DECIMAL(10,3) NOT NULL,
  actual_quantity DECIMAL(10,3),
  scrap_quantity DECIMAL(10,3) DEFAULT 0,
  yield_percentage DECIMAL(5,2),
  
  -- Quality tracking
  scrap_reason VARCHAR(50),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT check_status CHECK (
    status IN ('scheduled', 'in_progress', 'completed', 'cancelled')
  ),
  CONSTRAINT check_scrap_reason CHECK (
    scrap_reason IN (
      'normal_waste',
      'quality_issue',
      'equipment_failure',
      'operator_error',
      'material_defect',
      'other'
    ) OR scrap_reason IS NULL
  ),
  CONSTRAINT check_quantities CHECK (
    expected_quantity > 0
    AND (actual_quantity IS NULL OR actual_quantity >= 0)
    AND scrap_quantity >= 0
  ),
  CONSTRAINT check_yield_percentage CHECK (
    yield_percentage IS NULL
    OR (yield_percentage >= 0 AND yield_percentage <= 200)
  )
);

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Index for filtering by recipe
CREATE INDEX IF NOT EXISTS idx_production_batches_recipe_id
ON production_batches(recipe_id);

-- Index for filtering by material
CREATE INDEX IF NOT EXISTS idx_production_batches_material_id
ON production_batches(material_id)
WHERE material_id IS NOT NULL;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_production_batches_status
ON production_batches(status);

-- Index for scheduled jobs
CREATE INDEX IF NOT EXISTS idx_production_batches_scheduled
ON production_batches(scheduled_at, status)
WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;

-- Index for execution tracking
CREATE INDEX IF NOT EXISTS idx_production_batches_executed
ON production_batches(executed_at DESC)
WHERE executed_at IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_production_batches_recipe_status
ON production_batches(recipe_id, status, created_at DESC);

-- ============================================
-- CREATE UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_production_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_production_batches_updated_at
BEFORE UPDATE ON production_batches
FOR EACH ROW
EXECUTE FUNCTION update_production_batches_updated_at();

-- ============================================
-- CREATE YIELD CALCULATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION calculate_production_yield()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate yield percentage when actual quantity is set
  IF NEW.actual_quantity IS NOT NULL AND NEW.expected_quantity > 0 THEN
    NEW.yield_percentage := (NEW.actual_quantity / NEW.expected_quantity) * 100;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_production_yield
BEFORE INSERT OR UPDATE ON production_batches
FOR EACH ROW
WHEN (NEW.actual_quantity IS NOT NULL)
EXECUTE FUNCTION calculate_production_yield();

-- ============================================
-- ENABLE RLS (Row Level Security)
-- ============================================

ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Policy: Read access for authenticated users
CREATE POLICY "Production batches viewable by authenticated users"
ON public.production_batches
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy: Create access for authenticated users
CREATE POLICY "Production batches creatable by authenticated users"
ON public.production_batches
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Update access for admins and managers
CREATE POLICY "Production batches updatable by admins and managers"
ON public.production_batches
FOR UPDATE
USING (
  auth.jwt() ->> 'role' IN ('admin', 'manager', 'production_manager')
);

-- Policy: Delete access for admins only
CREATE POLICY "Production batches deletable by admins"
ON public.production_batches
FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE production_batches IS
'Tracks production execution (immediate and scheduled) for elaborated materials';

COMMENT ON COLUMN production_batches.recipe_id IS
'Reference to the recipe being executed';

COMMENT ON COLUMN production_batches.material_id IS
'Reference to the material being produced (optional, for tracking)';

COMMENT ON COLUMN production_batches.scheduled_at IS
'When the production is scheduled to start (NULL for immediate execution)';

COMMENT ON COLUMN production_batches.executed_at IS
'When the production was actually executed';

COMMENT ON COLUMN production_batches.status IS
'Current status: scheduled, in_progress, completed, cancelled';

COMMENT ON COLUMN production_batches.expected_quantity IS
'Expected output quantity from the recipe';

COMMENT ON COLUMN production_batches.actual_quantity IS
'Actual quantity produced (post-production measurement)';

COMMENT ON COLUMN production_batches.scrap_quantity IS
'Amount of waste/scrap generated during production';

COMMENT ON COLUMN production_batches.yield_percentage IS
'Production yield percentage (actual/expected * 100)';

COMMENT ON COLUMN production_batches.scrap_reason IS
'Reason for scrap/waste: normal_waste, quality_issue, equipment_failure, etc.';

COMMENT ON COLUMN production_batches.notes IS
'Additional notes about the production batch';

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  -- Check that table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'production_batches'
  ) THEN
    RAISE EXCEPTION 'Table production_batches was not created';
  END IF;

  -- Check that indexes exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'production_batches'
    AND indexname = 'idx_production_batches_recipe_id'
  ) THEN
    RAISE EXCEPTION 'Index idx_production_batches_recipe_id was not created';
  END IF;

  -- Check that RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'production_batches'
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS is not enabled on production_batches';
  END IF;

  RAISE NOTICE 'Migration completed successfully';
END $$;
