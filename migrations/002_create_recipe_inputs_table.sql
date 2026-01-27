-- Migration: 002_create_recipe_inputs_table.sql
-- Create new recipe_inputs table with explicit FKs (replaces recipe_ingredients)
-- Based on RECIPE_TECHNICAL_ARCHITECTURE.md

BEGIN;

-- 1. Create new recipe_inputs table
CREATE TABLE IF NOT EXISTS recipe_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Input items (explicit FKs - only ONE should be populated)
  input_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  input_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  input_asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  -- Quantity and unit
  quantity DECIMAL(15,6) NOT NULL,
  unit TEXT NOT NULL,

  -- Scrap factor (optional, can override recipe-level scrap factor)
  scrap_factor DECIMAL(5,2),

  -- Optional fields
  is_optional BOOLEAN DEFAULT FALSE,
  substitute_for_input_id UUID REFERENCES recipe_inputs(id),
  unit_cost_override DECIMAL(15,2),

  -- Ordering
  display_order INTEGER DEFAULT 0,
  stage INTEGER,
  stage_name TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_single_input CHECK (
    (input_material_id IS NOT NULL AND input_product_id IS NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NOT NULL AND input_asset_id IS NULL) OR
    (input_material_id IS NULL AND input_product_id IS NULL AND input_asset_id IS NOT NULL)
  ),
  CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  CONSTRAINT check_scrap_factor_range CHECK (scrap_factor IS NULL OR (scrap_factor >= 0 AND scrap_factor < 100)),

  -- Prevent duplicate inputs in same recipe
  UNIQUE(recipe_id, input_material_id, input_product_id, input_asset_id)
);

-- 2. Migrate data from old recipe_ingredients table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recipe_ingredients') THEN
    INSERT INTO recipe_inputs (
      recipe_id,
      input_material_id,
      quantity,
      unit,
      created_at
    )
    SELECT
      recipe_id,
      material_id,
      quantity,
      unit,
      created_at
    FROM recipe_ingredients
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_recipe_inputs_recipe ON recipe_inputs(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_inputs_material ON recipe_inputs(input_material_id) WHERE input_material_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipe_inputs_product ON recipe_inputs(input_product_id) WHERE input_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipe_inputs_asset ON recipe_inputs(input_asset_id) WHERE input_asset_id IS NOT NULL;

-- 4. Optional: Drop old table (UNCOMMENT ONLY AFTER VERIFICATION)
-- DROP TABLE IF EXISTS recipe_ingredients CASCADE;

COMMIT;

-- Verification queries (run separately to check migration success)
-- SELECT COUNT(*) FROM recipe_inputs WHERE input_material_id IS NULL AND input_product_id IS NULL AND input_asset_id IS NULL;
-- Expected: 0 (all inputs should have at least one item)
--
-- SELECT ri.*, m.name as material_name FROM recipe_inputs ri
-- LEFT JOIN materials m ON ri.input_material_id = m.id
-- LIMIT 10;
-- Should show migrated data with material names
