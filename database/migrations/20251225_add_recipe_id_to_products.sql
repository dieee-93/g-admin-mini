-- ============================================
-- PRODUCTS + RECIPE INTEGRATION
-- Migration Date: 2025-12-25
-- Purpose: Add recipe_id to products table for BOM/Kit support
-- ============================================
--
-- CONTEXT:
-- Products Module now supports Bill of Materials (BOM) and Kit configurations
-- via Recipe Module integration. This adds the recipe_id reference to products.
--
-- CHANGES:
-- 1. Add recipe_id column to products table
-- 2. Add foreign key constraint to recipes table
-- 3. Add index for performance
--
-- SUPPORTED USE CASES:
-- - Product with BOM (Materials → Product): Hamburguesa (pan + carne + lechuga)
-- - Kit de Productos (Products → Product): Combo (burger + fries + drink)
--
-- EXECUTION MODE:
-- - Products use executionMode='on_demand' (recipe executes on sale)
-- - Different from Materials which use executionMode='immediate'
--
-- ============================================

-- ============================================
-- STEP 1: Add recipe_id column
-- ============================================

ALTER TABLE products
ADD COLUMN IF NOT EXISTS recipe_id UUID;

-- ============================================
-- STEP 2: Add foreign key constraint
-- ============================================

-- Add constraint with ON DELETE SET NULL to allow recipe deletion
-- without cascading to products (products can exist without recipes)
ALTER TABLE products
ADD CONSTRAINT fk_products_recipe
FOREIGN KEY (recipe_id)
REFERENCES recipes(id)
ON DELETE SET NULL;

-- ============================================
-- STEP 3: Add index for performance
-- ============================================

-- Index for querying products by recipe
CREATE INDEX IF NOT EXISTS idx_products_recipe_id
ON products(recipe_id)
WHERE recipe_id IS NOT NULL;

-- ============================================
-- STEP 4: Add comment for documentation
-- ============================================

COMMENT ON COLUMN products.recipe_id IS
'Reference to recipe (BOM/Kit). Used for products with Bill of Materials or Kit configurations. Recipe executes on_demand (when product is sold).';

-- ============================================
-- VERIFICATION QUERIES (for testing)
-- ============================================

-- Verify column was added
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'products' AND column_name = 'recipe_id';

-- Verify foreign key constraint
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.table_name = 'products' AND tc.constraint_type = 'FOREIGN KEY'
--   AND kcu.column_name = 'recipe_id';

-- Verify index was created
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'products' AND indexname = 'idx_products_recipe_id';
