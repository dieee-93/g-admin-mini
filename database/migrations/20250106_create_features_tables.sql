-- ============================================
-- CREATE FEATURES SYSTEM TABLES
-- ============================================
-- Creates tables to store feature activation per organization
--
-- @version 1.0.0
-- @date 2025-01-06
-- @author G-Admin Team

BEGIN;

-- ============================================
-- 1. Create organizations table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Add index for slug lookups
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ============================================
-- 2. Create organization_features table
-- ============================================

CREATE TABLE IF NOT EXISTS organization_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'::jsonb,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    activated_by UUID, -- Reference to user who activated
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one feature per organization
    UNIQUE(organization_id, feature_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_features_org_id ON organization_features(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_features_feature_id ON organization_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_organization_features_enabled ON organization_features(enabled) WHERE enabled = true;

-- ============================================
-- 3. Add RLS policies
-- ============================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_features ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Organization features: Users can view features for their organization
CREATE POLICY "Users can view their organization features"
    ON organization_features FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE user_id = auth.uid()
        )
    );

-- Organization features: Only admins can modify
CREATE POLICY "Admins can manage organization features"
    ON organization_features FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id
            FROM user_profiles
            WHERE user_id = auth.uid()
            AND role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

-- ============================================
-- 4. Add triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_organizations_updated_at'
    ) THEN
        CREATE TRIGGER update_organizations_updated_at
            BEFORE UPDATE ON organizations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_organization_features_updated_at'
    ) THEN
        CREATE TRIGGER update_organization_features_updated_at
            BEFORE UPDATE ON organization_features
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- 5. Insert default organization (for development)
-- ============================================

-- Insert a default organization if none exists
INSERT INTO organizations (id, name, slug, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Default Organization',
    'default',
    '{"initialized": true}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. Insert default features for default organization
-- ============================================

-- Core features that should be enabled by default
INSERT INTO organization_features (organization_id, feature_id, enabled)
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 'sales_order_management', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'sales_payment_processing', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'inventory_stock_tracking', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'inventory_alert_system', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'products_recipe_management', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'products_catalog_menu', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'production_order_management', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'production_display_system', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'customer_service_history', true),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'staff_employee_management', true)
ON CONFLICT (organization_id, feature_id) DO NOTHING;

-- ============================================
-- 7. Log migration
-- ============================================

DO $$
DECLARE
    orgs_count INTEGER;
    features_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orgs_count FROM organizations;
    SELECT COUNT(*) INTO features_count FROM organization_features;

    RAISE NOTICE 'Features system tables created successfully';
    RAISE NOTICE 'Organizations: %', orgs_count;
    RAISE NOTICE 'Active features: %', features_count;
END $$;

COMMIT;
