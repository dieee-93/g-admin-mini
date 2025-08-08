-- ========================================================
-- CUSTOMER MODULE FIXES - Database Issues Resolution
-- ========================================================
-- Fixes for: Foreign key relationships, RFM functions, schema consistency
-- Date: 2025-08-07

-- ========================================================
-- 1. FIX SALES -> SALE_ITEMS FOREIGN KEY RELATIONSHIP
-- ========================================================

DO $$
BEGIN
    -- Check if sale_items table exists and needs foreign key fix
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sale_items') THEN
        
        -- Drop existing foreign key constraint if it exists (may be incorrect)
        IF EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE table_name = 'sale_items' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%sale_id%'
        ) THEN
            ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey;
            ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS fk_sale_items_sale_id;
        END IF;
        
        -- Ensure sale_id column is UUID type
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'sale_items' AND column_name = 'sale_id' 
            AND data_type != 'uuid'
        ) THEN
            -- Convert BIGINT sale_id to UUID if needed
            ALTER TABLE sale_items ALTER COLUMN sale_id TYPE UUID USING sale_id::text::uuid;
        END IF;
        
        -- Add proper foreign key constraint
        ALTER TABLE sale_items 
        ADD CONSTRAINT fk_sale_items_sale_id 
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Fixed sale_items foreign key relationship';
    END IF;
    
    -- Ensure sales table has proper UUID structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales') THEN
        -- Ensure customer_id is UUID
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'sales' AND column_name = 'customer_id' 
            AND data_type != 'uuid'
        ) THEN
            ALTER TABLE sales ALTER COLUMN customer_id TYPE UUID USING customer_id::text::uuid;
        END IF;
        
        -- Add foreign key to customers if missing
        IF NOT EXISTS (
            SELECT FROM information_schema.table_constraints 
            WHERE table_name = 'sales' AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%customer_id%'
        ) THEN
            ALTER TABLE sales 
            ADD CONSTRAINT fk_sales_customer_id 
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
        END IF;
    END IF;

END $$;

-- ========================================================
-- 2. ENSURE CUSTOMER_INTELLIGENCE SCHEMA PERMISSIONS
-- ========================================================

-- Grant proper permissions to customer_intelligence schema
GRANT USAGE ON SCHEMA customer_intelligence TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA customer_intelligence TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA customer_intelligence TO authenticated;

-- Specifically for RFM profiles table
GRANT ALL ON customer_intelligence.customer_rfm_profiles TO authenticated;

-- ========================================================
-- 3. CREATE HELPER FUNCTION FOR API
-- ========================================================

-- Function to get customer RFM data in format expected by frontend
CREATE OR REPLACE FUNCTION get_customer_rfm_data()
RETURNS TABLE (
    customer_id UUID,
    rfm_segment TEXT,
    churn_risk TEXT,
    lifetime_value NUMERIC,
    avg_order_value NUMERIC,
    recency_days INTEGER,
    frequency_count INTEGER,
    is_vip BOOLEAN,
    loyalty_tier TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rfm.customer_id,
        (rfm.rfm_metrics->>'segment')::TEXT,
        (rfm.intelligence->>'churn_risk')::TEXT,
        (rfm.intelligence->>'lifetime_value')::NUMERIC,
        (rfm.intelligence->>'avg_order_value')::NUMERIC,
        (rfm.intelligence->>'recency_days')::INTEGER,
        (rfm.intelligence->>'frequency_count')::INTEGER,
        (rfm.intelligence->>'is_vip')::BOOLEAN,
        (rfm.intelligence->>'loyalty_tier')::TEXT,
        rfm.calculated_at
    FROM customer_intelligence.customer_rfm_profiles rfm;
END;
$$;

-- Grant access to the helper function
GRANT EXECUTE ON FUNCTION get_customer_rfm_data() TO authenticated;

-- ========================================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================================

-- Add indexes for common queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_sales_customer_id_created_at 
ON sales (customer_id, created_at);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id 
ON sale_items (sale_id);

-- JSONB indexes for RFM queries
CREATE INDEX IF NOT EXISTS idx_rfm_segment 
ON customer_intelligence.customer_rfm_profiles 
USING GIN ((rfm_metrics->'segment'));

CREATE INDEX IF NOT EXISTS idx_rfm_churn_risk 
ON customer_intelligence.customer_rfm_profiles 
USING GIN ((intelligence->'churn_risk'));

-- ========================================================
-- 5. VALIDATION QUERIES
-- ========================================================

-- Test the foreign key relationship
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints 
    WHERE table_name = 'sale_items' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'fk_sale_items_sale_id';
    
    IF fk_count > 0 THEN
        RAISE NOTICE 'SUCCESS: sale_items foreign key constraint exists';
    ELSE
        RAISE WARNING 'ISSUE: sale_items foreign key constraint missing';
    END IF;
END $$;

-- Test RFM function access
DO $$
BEGIN
    PERFORM calculate_customer_rfm_profiles(30);
    RAISE NOTICE 'SUCCESS: RFM function accessible and working';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'ISSUE with RFM function: %', SQLERRM;
END $$;

SELECT 'Customer Module Database Fixes Applied Successfully!' as status;