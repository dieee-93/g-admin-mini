-- Migration: 001_add_recipe_fk_columns.sql
-- Add explicit FK columns to recipes table for proper referential integrity
-- Based on RECIPE_TECHNICAL_ARCHITECTURE.md

BEGIN;

-- 1. Add new FK columns for output (explicit FKs instead of polymorphic)
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS output_material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS output_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS output_service_id UUID REFERENCES services(id) ON DELETE CASCADE;

-- 2. Add new metadata columns
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'material',
ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'immediate',
ADD COLUMN IF NOT EXISTS output_quantity DECIMAL(15,6) DEFAULT 1,
ADD COLUMN IF NOT EXISTS scrap_factor DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Add constraints
DO $$
BEGIN
    -- Check constraint for entity_type
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_entity_type'
    ) THEN
        ALTER TABLE recipes
        ADD CONSTRAINT check_entity_type
        CHECK (entity_type IN ('material', 'product', 'service'));
    END IF;

    -- Check constraint for execution_mode
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_execution_mode'
    ) THEN
        ALTER TABLE recipes
        ADD CONSTRAINT check_execution_mode
        CHECK (execution_mode IN ('immediate', 'on_demand'));
    END IF;

    -- Check constraint for scrap_factor
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_scrap_factor'
    ) THEN
        ALTER TABLE recipes
        ADD CONSTRAINT check_scrap_factor
        CHECK (scrap_factor >= 0 AND scrap_factor < 100);
    END IF;

    -- Check constraint for output_quantity
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_output_quantity'
    ) THEN
        ALTER TABLE recipes
        ADD CONSTRAINT check_output_quantity
        CHECK (output_quantity > 0);
    END IF;

    -- Check constraint for single output (only ONE FK should be populated)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'check_single_output'
    ) THEN
        ALTER TABLE recipes
        ADD CONSTRAINT check_single_output CHECK (
            (output_material_id IS NOT NULL AND output_product_id IS NULL AND output_service_id IS NULL) OR
            (output_material_id IS NULL AND output_product_id IS NOT NULL AND output_service_id IS NULL) OR
            (output_material_id IS NULL AND output_product_id IS NULL AND output_service_id IS NOT NULL)
        );
    END IF;
END $$;

-- 4. Migrate existing data (if any recipes exist linked to materials)
-- Populate output_material_id based on existing material.recipe_id relationships
UPDATE recipes r
SET output_material_id = m.id,
    entity_type = 'material',
    execution_mode = 'immediate'
FROM materials m
WHERE m.recipe_id = r.id
  AND r.output_material_id IS NULL;

-- 5. Create indices for performance
CREATE INDEX IF NOT EXISTS idx_recipes_material ON recipes(output_material_id) WHERE output_material_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(output_product_id) WHERE output_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_service ON recipes(output_service_id) WHERE output_service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_active ON recipes(is_active, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_entity_type ON recipes(entity_type);

COMMIT;

-- Verification query (run separately to check migration success)
-- SELECT COUNT(*) FROM recipes WHERE output_material_id IS NULL AND output_product_id IS NULL AND output_service_id IS NULL;
-- Expected: 0 (all recipes should have at least one output)
