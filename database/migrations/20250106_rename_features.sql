-- ============================================
-- Feature Renaming Migration
-- ============================================
-- Renames features to follow {domain}_{concern} convention
-- - Production: production_bom_management → production_order_management
-- - Sales → Products: Moves catalog and package features
--
-- @version 1.0.0
-- @date 2025-01-06
-- @author G-Admin Team

BEGIN;

-- ============================================
-- 1. Update existing features
-- ============================================

-- Rename production_bom_management to products_recipe_management
UPDATE organization_features
SET feature_id = 'products_recipe_management'
WHERE feature_id = 'production_bom_management';

-- Rename sales_catalog_menu to products_catalog_menu
UPDATE organization_features
SET feature_id = 'products_catalog_menu'
WHERE feature_id = 'sales_catalog_menu';

-- Rename sales_catalog_ecommerce to products_catalog_ecommerce
UPDATE organization_features
SET feature_id = 'products_catalog_ecommerce'
WHERE feature_id = 'sales_catalog_ecommerce';

-- Rename sales_package_management to products_package_management
UPDATE organization_features
SET feature_id = 'products_package_management'
WHERE feature_id = 'sales_package_management';

-- ============================================
-- 2. Add new Production feature
-- ============================================

-- Create production_order_management for organizations that had recipe management
INSERT INTO organization_features (organization_id, feature_id, enabled)
SELECT organization_id, 'production_order_management', enabled
FROM organization_features
WHERE feature_id = 'products_recipe_management'
ON CONFLICT (organization_id, feature_id) DO NOTHING;

-- ============================================
-- 3. Log migration
-- ============================================

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Count affected records
    SELECT COUNT(*) INTO updated_count
    FROM organization_features
    WHERE feature_id IN (
        'products_recipe_management',
        'products_catalog_menu',
        'products_catalog_ecommerce',
        'products_package_management',
        'production_order_management'
    );

    RAISE NOTICE 'Feature renaming migration completed. Affected records: %', updated_count;
END $$;

COMMIT;
