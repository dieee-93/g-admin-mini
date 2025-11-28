-- ============================================
-- ADD is_published FIELD TO PRODUCTS
-- Migration Date: 2025-11-17
-- Purpose: TakeAway requirement - track published products
-- ============================================
--
-- REQUIREMENT:
-- - TakeAway achievement: "Publicar al menos 5 productos"
-- - Validator: ctx.products?.filter((p) => p.is_published).length >= 5
--
-- DESIGN DECISION:
-- - Default FALSE: New products not published by default
-- - Explicit action required: Owner must mark as "ready to sell"
-- - Use cases:
--   * Products in development (not ready)
--   * Seasonal products (unpublished off-season)
--   * Discontinued products (unpublish instead of delete)
--   * TakeAway/E-commerce catalog (only show published)
--
-- ============================================

-- Add is_published column (default FALSE)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.is_published IS 
'Indicates if product is published and available for sale in public catalogs (TakeAway, E-commerce). Default FALSE.';

-- Create index for performance (frequently filtered)
CREATE INDEX IF NOT EXISTS idx_products_is_published 
ON products(is_published)
WHERE is_published = TRUE;

-- Create composite index for published products by category
CREATE INDEX IF NOT EXISTS idx_products_published_category 
ON products(category, is_published)
WHERE is_published = TRUE;

-- ============================================
-- OPTIONAL: Mark existing products as published
-- (Uncomment if you want existing products available immediately)
-- ============================================

-- UPDATE products
-- SET is_published = TRUE
-- WHERE is_active = TRUE; -- Only mark active products

-- ============================================
-- RLS POLICY: Published products visible to public
-- ============================================

-- Allow anonymous users to view published products (for customer app)
CREATE POLICY "Published products viewable by anyone"
  ON products FOR SELECT
  USING (is_published = TRUE);

-- Only authenticated users can modify publish status
-- (Existing admin policies already cover this)
