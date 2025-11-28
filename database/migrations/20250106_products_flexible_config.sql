-- ============================================
-- PRODUCTS MODULE: FLEXIBLE CONFIGURATION SYSTEM
-- Migration Date: 2025-01-06
-- Session Plan: SESSION_PLAN_PRODUCTS_COMPLETE.md - Session 2
-- ============================================
--
-- PURPOSE:
-- Transforms rigid ProductType system into flexible ProductConfig
-- Supports 8+ business models (Food, Services, Digital, Events, etc.)
-- Makes BOM (Bill of Materials) optional for service products
--
-- CHANGES:
-- 1. Add `category` column (replaces rigid `type`)
-- 2. Add `config` JSONB (flexible product configuration)
-- 3. Add `optional_components` JSONB (materials added during service)
-- 4. Add `pricing` JSONB (structured pricing data)
-- 5. Add `availability` JSONB (availability status & stock)
-- 6. Migrate existing data from old `type` to new system
-- 7. Create indexes for performance
--
-- ============================================

-- ============================================
-- STEP 1: Add New Columns
-- ============================================

-- Category: FOOD, BEVERAGE, BEAUTY_SERVICE, etc.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category TEXT;

-- Config: Flexible product configuration
ALTER TABLE products
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Optional components: Materials added dynamically
ALTER TABLE products
ADD COLUMN IF NOT EXISTS optional_components JSONB DEFAULT '[]'::jsonb;

-- Pricing: Structured pricing information
ALTER TABLE products
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT '{}'::jsonb;

-- Availability: Stock and availability status
ALTER TABLE products
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}'::jsonb;

-- ============================================
-- STEP 2: Migrate Existing Data
-- ============================================

UPDATE products
SET
  -- Map old type to new category
  category = CASE
    WHEN type = 'ELABORATED' THEN 'FOOD'
    WHEN type = 'SERVICE' THEN 'PROFESSIONAL_SERVICE'
    WHEN type = 'DIGITAL' THEN 'DIGITAL_PRODUCT'
    ELSE 'CUSTOM'
  END,

  -- Create config based on old type
  config = jsonb_build_object(
    'has_components', CASE WHEN type IN ('ELABORATED', 'SERVICE') THEN true ELSE false END,
    'components_required', CASE WHEN type = 'ELABORATED' THEN true ELSE false END,
    'allow_dynamic_materials', false,
    'requires_production', CASE WHEN type = 'ELABORATED' THEN true ELSE false END,
    'production_type', CASE WHEN type = 'ELABORATED' THEN 'kitchen' ELSE 'none' END,
    'requires_staff', CASE WHEN type = 'SERVICE' THEN true ELSE false END,
    'has_duration', CASE WHEN type IN ('SERVICE', 'DIGITAL') THEN true ELSE false END,
    'requires_booking', CASE WHEN type = 'SERVICE' THEN true ELSE false END,
    'is_digital', CASE WHEN type = 'DIGITAL' THEN true ELSE false END,
    'is_retail', false
  ),

  -- Create pricing structure
  pricing = jsonb_build_object(
    'base_cost', COALESCE(cost, 0),
    'price', COALESCE(price, 0),
    'profit_margin', CASE
      WHEN price > 0 AND cost IS NOT NULL THEN
        ((price - cost) / price * 100)
      ELSE 0
    END
  ),

  -- Create availability structure
  availability = jsonb_build_object(
    'status', CASE
      WHEN availability > 50 THEN 'available'
      WHEN availability > 0 THEN 'low_stock'
      ELSE 'unavailable'
    END,
    'can_produce_quantity', COALESCE(availability, 0)
  )

WHERE category IS NULL;

-- ============================================
-- STEP 3: Create Indexes
-- ============================================

-- Index on category for fast filtering
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category);

-- GIN index on config JSONB for fast queries
CREATE INDEX IF NOT EXISTS idx_products_config
ON products USING GIN(config);

-- GIN index on pricing for margin queries
CREATE INDEX IF NOT EXISTS idx_products_pricing
ON products USING GIN(pricing);

-- ============================================
-- STEP 4: Add Comments
-- ============================================

COMMENT ON COLUMN products.category IS 'Product category: FOOD, BEVERAGE, BEAUTY_SERVICE, PROFESSIONAL_SERVICE, EVENT, COURSE, DIGITAL_PRODUCT, RENTAL, CUSTOM';
COMMENT ON COLUMN products.config IS 'Flexible product configuration (has_components, requires_production, requires_staff, requires_booking, is_digital, is_retail)';
COMMENT ON COLUMN products.optional_components IS 'Materials that can be added dynamically during service execution';
COMMENT ON COLUMN products.pricing IS 'Structured pricing data (base_cost, labor_cost, overhead_cost, price, profit_margin)';
COMMENT ON COLUMN products.availability IS 'Availability status and stock information';

-- ============================================
-- STEP 5: Validation (Optional)
-- ============================================

-- Check migration results
DO $$
DECLARE
  migrated_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM products;
  SELECT COUNT(*) INTO migrated_count FROM products WHERE category IS NOT NULL AND config IS NOT NULL;

  RAISE NOTICE 'Migration complete: % of % products migrated', migrated_count, total_count;

  IF migrated_count < total_count THEN
    RAISE WARNING 'Some products were not migrated. Please review.';
  END IF;
END $$;

-- ============================================
-- NOTES:
-- ============================================
-- - Old `type` column kept for backwards compatibility
-- - Can be dropped later: ALTER TABLE products DROP COLUMN type;
-- - Old `cost`, `price`, `availability` columns can be dropped after confirming data migration
-- - Update application code to use new columns before dropping old ones
--
-- ROLLBACK (if needed):
-- ALTER TABLE products DROP COLUMN IF EXISTS category;
-- ALTER TABLE products DROP COLUMN IF EXISTS config;
-- ALTER TABLE products DROP COLUMN IF EXISTS optional_components;
-- ALTER TABLE products DROP COLUMN IF EXISTS pricing;
-- ALTER TABLE products DROP COLUMN IF EXISTS availability;
-- ============================================
