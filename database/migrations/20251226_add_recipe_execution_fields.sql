-- Migration: Add execution_mode and entity_type to recipes table
-- Purpose: Support different execution modes for Materials (immediate) vs Products (on_demand)
-- Date: 2025-12-26
-- Related: Products + Recipe Integration

-- ============================================
-- ADD NEW COLUMNS
-- ============================================

-- Add entity_type column
-- Defines what type of entity this recipe produces
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20);

-- Add execution_mode column
-- Defines when the recipe should be executed (stock consumption)
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS execution_mode VARCHAR(20);

-- ============================================
-- SET DEFAULT VALUES FOR EXISTING RECORDS
-- ============================================

-- Set default values for existing recipes
-- Assume existing recipes are for materials with immediate execution
UPDATE recipes
SET
    entity_type = 'material',
    execution_mode = 'immediate'
WHERE entity_type IS NULL OR execution_mode IS NULL;

-- ============================================
-- ADD CONSTRAINTS
-- ============================================

-- Make columns NOT NULL after setting defaults
ALTER TABLE recipes
ALTER COLUMN entity_type SET NOT NULL,
ALTER COLUMN execution_mode SET NOT NULL;

-- Add CHECK constraints for valid values
ALTER TABLE recipes
ADD CONSTRAINT check_entity_type
CHECK (entity_type IN ('material', 'product', 'kit', 'service'));

ALTER TABLE recipes
ADD CONSTRAINT check_execution_mode
CHECK (execution_mode IN ('immediate', 'on_demand'));

-- ============================================
-- ADD INDEXES
-- ============================================

-- Index for filtering by entity type
CREATE INDEX IF NOT EXISTS idx_recipes_entity_type
ON recipes(entity_type);

-- Index for filtering by execution mode
CREATE INDEX IF NOT EXISTS idx_recipes_execution_mode
ON recipes(execution_mode);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_recipes_entity_execution
ON recipes(entity_type, execution_mode);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN recipes.entity_type IS
'Type of entity this recipe produces: material, product, kit, or service';

COMMENT ON COLUMN recipes.execution_mode IS
'When to execute recipe: immediate (materials - at creation) or on_demand (products - at sale)';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the changes
DO $$
BEGIN
    -- Check that columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'recipes'
        AND column_name = 'entity_type'
    ) THEN
        RAISE EXCEPTION 'Column entity_type was not created';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'recipes'
        AND column_name = 'execution_mode'
    ) THEN
        RAISE EXCEPTION 'Column execution_mode was not created';
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$;
